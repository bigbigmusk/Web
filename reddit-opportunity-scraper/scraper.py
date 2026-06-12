"""编排层：抓取 → 规则初筛 → AI 精判 → 汇总。

被 CLI 和 Web 共用。通过 progress 回调向上层（网页/命令行）汇报实时进度。
"""
from __future__ import annotations

from typing import Callable

import config
import detector
import reddit_client


def _noop(*_args, **_kwargs):
    pass


def run_scrape(
    subreddits: list[str],
    *,
    sort: str = "new",
    limit: int = 50,
    time_filter: str = "week",
    use_ai: bool = True,
    min_rule_score: int = 3,
    max_ai_calls: int = 60,
    progress: Callable[[dict], None] = _noop,
) -> dict:
    """执行一次完整抓取识别。

    Args:
        subreddits: 子版块列表
        sort/limit/time_filter: 抓取参数
        use_ai: 是否启用 AI 精判（需已配置密钥才真正生效）
        min_rule_score: 规则分达到该阈值的帖子才送 AI 精判（控制成本）
        max_ai_calls: 单次最多调用多少次 AI（硬性成本上限）
        progress: 进度回调，收到 {stage, message, current, total} 形状的 dict

    Returns:
        {records, stats} —— records 是带识别结果的帖子列表，stats 是统计概览。
    """
    ai_enabled = use_ai and config.has_anthropic()
    source = reddit_client.active_source()

    # 1) 抓取
    progress(
        {
            "stage": "fetch",
            "message": f"正在通过 {source.upper()} 抓取 {len(subreddits)} 个子版块…",
            "current": 0,
            "total": 0,
        }
    )
    posts = reddit_client.fetch_posts(
        subreddits, sort=sort, limit=limit, time_filter=time_filter
    )
    progress(
        {
            "stage": "fetched",
            "message": f"共抓取 {len(posts)} 条帖子，开始规则初筛…",
            "current": 0,
            "total": len(posts),
        }
    )

    # 2) 规则初筛（全部帖子）
    scored: list[tuple] = []  # (post, rule_score, matched)
    for post in posts:
        rs, matched = detector.score_rules(post.full_text)
        scored.append((post, rs, matched))

    # 选出送 AI 精判的候选（按规则分降序，受 max_ai_calls 限制）
    candidates = sorted(
        [s for s in scored if s[1] >= min_rule_score],
        key=lambda s: s[1],
        reverse=True,
    )
    ai_targets = {id(s[0]) for s in candidates[:max_ai_calls]} if ai_enabled else set()

    progress(
        {
            "stage": "filtered",
            "message": (
                f"规则初筛出 {len(candidates)} 个候选，"
                + (
                    f"将对前 {len(ai_targets)} 个做 AI 精判…"
                    if ai_enabled
                    else "未启用 AI，直接用规则结果。"
                )
            ),
            "current": 0,
            "total": len(ai_targets) if ai_enabled else len(posts),
        }
    )

    # 3) 逐条识别
    records: list[dict] = []
    ai_done = 0
    for post, rs, matched in scored:
        run_ai = id(post) in ai_targets
        det = detector.detect(
            post.title,
            post.selftext,
            post.subreddit,
            use_ai=ai_enabled,
            run_ai=run_ai,
        )
        records.append({**post.to_dict(), **det.__dict__})

        if run_ai:
            ai_done += 1
            progress(
                {
                    "stage": "judging",
                    "message": f"AI 精判中 {ai_done}/{len(ai_targets)}：{post.title[:40]}",
                    "current": ai_done,
                    "total": len(ai_targets),
                }
            )

    # 4) 统计
    opportunities = [r for r in records if r.get("is_opportunity")]
    stats = {
        "source": source,
        "ai_enabled": ai_enabled,
        "total_posts": len(posts),
        "candidates": len(candidates),
        "ai_judged": ai_done,
        "opportunities": len(opportunities),
        "subreddits": subreddits,
    }
    progress(
        {
            "stage": "done",
            "message": f"完成：从 {len(posts)} 条帖子中识别出 {len(opportunities)} 个商业机会。",
            "current": len(records),
            "total": len(records),
        }
    )
    return {"records": records, "stats": stats}
