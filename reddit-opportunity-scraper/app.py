"""Flask 网页界面：填参数 → 后台抓取 → 实时进度 → 浏览结果 → 下载 Excel。

抓取（尤其带 AI 精判）较慢，所以在后台线程里跑，前端轮询 /api/status 拿进度。
"""
from __future__ import annotations

import threading
import uuid

from flask import Flask, jsonify, request, send_file

import config
import excel_exporter
import reddit_client
import scraper

app = Flask(__name__, static_folder="static", template_folder="templates")

# 简单的内存任务表：job_id -> {status, progress, result, error, excel_path}
JOBS: dict[str, dict] = {}
_lock = threading.Lock()


def _run_job(job_id: str, params: dict) -> None:
    def on_progress(p: dict) -> None:
        with _lock:
            JOBS[job_id]["progress"] = p

    try:
        result = scraper.run_scrape(
            params["subreddits"],
            sort=params["sort"],
            limit=params["limit"],
            time_filter=params["time_filter"],
            use_ai=params["use_ai"],
            min_rule_score=params["min_rule_score"],
            max_ai_calls=params["max_ai_calls"],
            progress=on_progress,
        )
        # 落盘 Excel
        excel_path = excel_exporter.export(result["records"], config.OUTPUT_DIR)
        with _lock:
            JOBS[job_id].update(
                status="done",
                result=result,
                excel_path=excel_path,
            )
    except Exception as exc:  # noqa: BLE001
        with _lock:
            JOBS[job_id].update(status="error", error=str(exc))


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/api/config")
def api_config():
    """前端用来展示当前数据源 / AI 状态。"""
    return jsonify(
        {
            "source": reddit_client.active_source(),
            "ai_enabled": config.has_anthropic(),
            "praw": config.has_praw_credentials(),
            "model": config.AI_MODEL,
        }
    )


@app.route("/api/scrape", methods=["POST"])
def api_scrape():
    data = request.get_json(force=True) or {}
    raw_subs = data.get("subreddits", "")
    if isinstance(raw_subs, str):
        subreddits = [s for s in raw_subs.replace(",", " ").split() if s.strip()]
    else:
        subreddits = [str(s).strip() for s in raw_subs if str(s).strip()]

    if not subreddits:
        return jsonify({"error": "请至少填写一个子版块"}), 400

    params = {
        "subreddits": subreddits,
        "sort": data.get("sort", "new"),
        "limit": int(data.get("limit", 50)),
        "time_filter": data.get("time_filter", "week"),
        "use_ai": bool(data.get("use_ai", True)),
        "min_rule_score": int(data.get("min_rule_score", 3)),
        "max_ai_calls": int(data.get("max_ai_calls", 60)),
    }

    job_id = uuid.uuid4().hex[:12]
    with _lock:
        JOBS[job_id] = {
            "status": "running",
            "progress": {"stage": "queued", "message": "任务已排队…"},
            "result": None,
            "error": None,
            "excel_path": None,
        }
    threading.Thread(target=_run_job, args=(job_id, params), daemon=True).start()
    return jsonify({"job_id": job_id})


@app.route("/api/status/<job_id>")
def api_status(job_id: str):
    with _lock:
        job = JOBS.get(job_id)
        if not job:
            return jsonify({"error": "任务不存在"}), 404
        resp = {
            "status": job["status"],
            "progress": job["progress"],
            "error": job["error"],
        }
        if job["status"] == "done" and job["result"]:
            resp["stats"] = job["result"]["stats"]
            # 仅回传机会条目用于前端展示，避免数据过大
            opps = [
                r for r in job["result"]["records"] if r.get("is_opportunity")
            ]
            resp["opportunities"] = sorted(
                opps,
                key=lambda r: (r.get("ai_confidence", 0), r.get("rule_score", 0)),
                reverse=True,
            )
            resp["has_excel"] = bool(job["excel_path"])
    return jsonify(resp)


@app.route("/api/download/<job_id>")
def api_download(job_id: str):
    with _lock:
        job = JOBS.get(job_id)
    if not job or not job.get("excel_path"):
        return jsonify({"error": "结果不存在"}), 404
    return send_file(job["excel_path"], as_attachment=True)


if __name__ == "__main__":
    print(f"▶ Reddit 商业机会爬虫已启动：http://127.0.0.1:{config.PORT}")
    print(
        f"  数据源：{reddit_client.active_source().upper()}　"
        f"AI 精判：{'开' if config.has_anthropic() else '关（未配置密钥）'}"
    )
    app.run(host="0.0.0.0", port=config.PORT, debug=False)
