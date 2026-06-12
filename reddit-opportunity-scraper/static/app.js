"use strict";

const $ = (id) => document.getElementById(id);

// ---- 启动时加载当前配置（数据源 / AI 状态）----
async function loadConfig() {
  try {
    const cfg = await (await fetch("/api/config")).json();
    const chips = $("status-chips");
    const src =
      cfg.source === "praw" ? "数据源：PRAW" : "数据源：公开 JSON";
    const ai = cfg.ai_enabled
      ? `AI 精判：开 (${cfg.model})`
      : "AI 精判：关（未配置密钥）";
    chips.innerHTML =
      `<span class="chip ${cfg.praw ? "on" : ""}">${src}</span>` +
      `<span class="chip ${cfg.ai_enabled ? "on" : "off"}">${ai}</span>`;
    if (!cfg.ai_enabled) $("use_ai").checked = false;
  } catch (e) {
    console.error(e);
  }
}

// ---- 预设按钮 ----
document.querySelectorAll(".preset").forEach((btn) => {
  btn.addEventListener("click", () => {
    $("subreddits").value = btn.dataset.v;
  });
});

// ---- 开始抓取 ----
$("run-btn").addEventListener("click", startScrape);

async function startScrape() {
  const subreddits = $("subreddits").value.trim();
  if (!subreddits) {
    alert("请至少填写一个子版块");
    return;
  }
  const payload = {
    subreddits,
    sort: $("sort").value,
    time_filter: $("time_filter").value,
    limit: parseInt($("limit").value, 10) || 50,
    min_rule_score: parseInt($("min_rule_score").value, 10) || 0,
    use_ai: $("use_ai").checked,
    max_ai_calls: parseInt($("max_ai_calls").value, 10) || 0,
  };

  setRunning(true);
  $("cards").innerHTML = "";
  $("stats").classList.add("hidden");
  $("download-btn").classList.add("hidden");
  $("empty").classList.add("hidden");
  showProgress(0, "任务已提交…");

  let jobId;
  try {
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "提交失败");
    jobId = data.job_id;
  } catch (e) {
    showProgress(0, "❌ " + e.message);
    setRunning(false);
    return;
  }

  poll(jobId);
}

// ---- 轮询任务状态 ----
function poll(jobId) {
  const timer = setInterval(async () => {
    let data;
    try {
      data = await (await fetch(`/api/status/${jobId}`)).json();
    } catch (e) {
      return; // 网络抖动，下次再试
    }

    const p = data.progress || {};
    const pct =
      p.total > 0 ? Math.round((p.current / p.total) * 100) : null;
    showProgress(pct, p.message || p.stage || "处理中…");

    if (data.status === "done") {
      clearInterval(timer);
      setRunning(false);
      renderResults(data, jobId);
    } else if (data.status === "error") {
      clearInterval(timer);
      setRunning(false);
      showProgress(0, "❌ " + (data.error || "任务失败"));
    }
  }, 1200);
}

// ---- 渲染结果 ----
function renderResults(data, jobId) {
  const s = data.stats || {};
  $("stats").classList.remove("hidden");
  $("stats").innerHTML = [
    statBox(s.total_posts, "抓取帖子"),
    statBox(s.candidates, "规则候选"),
    statBox(s.ai_judged, "AI 精判"),
    statBox(s.opportunities, "💡 机会"),
  ].join("");

  const dl = $("download-btn");
  dl.href = `/api/download/${jobId}`;
  dl.classList.remove("hidden");

  const opps = data.opportunities || [];
  if (opps.length === 0) {
    $("cards").innerHTML =
      `<div class="empty">本次未识别出明确的商业机会，可尝试调低规则阈值、换子版块或换排序。</div>`;
    return;
  }
  $("cards").innerHTML = opps.map(cardHtml).join("");
}

function statBox(num, lbl) {
  return `<div class="stat"><div class="num">${num ?? 0}</div><div class="lbl">${lbl}</div></div>`;
}

function esc(s) {
  return (s ?? "").toString().replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
  );
}

function cardHtml(r) {
  const conf = r.ai_used ? `${r.ai_confidence}分` : `规则${r.rule_score}`;
  const rows = [
    ["目标用户", r.target_audience],
    ["核心痛点", r.pain_point],
    ["建议方案", r.suggested_solution],
    ["变现方式", r.monetization],
    ["判断理由", r.reasoning],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`)
    .join("");

  return `
    <div class="card">
      <div class="card-head">
        <h3 class="card-title">
          <a href="${esc(r.permalink)}" target="_blank" rel="noopener">${esc(r.title)}</a>
        </h3>
        <span class="conf">${conf}</span>
      </div>
      <div class="card-meta">
        <span class="tag">r/${esc(r.subreddit)}</span>
        ${r.opportunity_type ? `<span class="tag">${esc(r.opportunity_type)}</span>` : ""}
        👍 ${r.score} · 💬 ${r.num_comments} · u/${esc(r.author)}
      </div>
      ${rows ? `<dl class="card-grid">${rows}</dl>` : ""}
    </div>`;
}

// ---- 进度条 / 运行态 ----
function showProgress(pct, msg) {
  $("progress").classList.remove("hidden");
  if (pct === null) {
    $("bar-fill").style.width = "100%";
    $("bar-fill").style.opacity = "0.4";
  } else {
    $("bar-fill").style.opacity = "1";
    $("bar-fill").style.width = pct + "%";
  }
  $("progress-msg").textContent = msg;
}

function setRunning(running) {
  const btn = $("run-btn");
  btn.disabled = running;
  btn.textContent = running ? "⏳ 抓取中…" : "🚀 开始抓取";
}

loadConfig();
