"""Reddit 抓取层。

支持两种数据源，自动选择：
  1. 公开 JSON 接口（无需密钥，有速率限制）—— 默认
  2. PRAW 官方库（配置了 client_id/secret 时自动启用）—— 更稳定、限额更高

对外暴露统一的 `fetch_posts()`，返回标准化的 dict 列表，
让上层（识别、导出）无需关心底层用的是哪种数据源。
"""
from __future__ import annotations

import time
from dataclasses import asdict, dataclass
from typing import Iterable

import requests

import config


@dataclass
class RedditPost:
    """标准化后的帖子结构（两种数据源产出同一形状）。"""

    id: str
    subreddit: str
    title: str
    selftext: str
    author: str
    score: int
    num_comments: int
    upvote_ratio: float
    created_utc: float
    permalink: str
    url: str
    flair: str

    def to_dict(self) -> dict:
        return asdict(self)

    @property
    def full_text(self) -> str:
        return f"{self.title}\n\n{self.selftext}".strip()


# ----------------------------------------------------------------------------
# 公开 JSON 数据源
# ----------------------------------------------------------------------------
_JSON_BASE = "https://www.reddit.com"
_HEADERS = {"User-Agent": config.REDDIT_USER_AGENT or "opportunity-scraper/1.0"}


def _fetch_via_json(
    subreddit: str,
    sort: str,
    limit: int,
    time_filter: str,
) -> list[RedditPost]:
    """用公开 .json 端点抓取。limit 最多 100/请求，超出会自动翻页。"""
    posts: list[RedditPost] = []
    after: str | None = None
    remaining = limit

    while remaining > 0:
        batch = min(100, remaining)
        params = {"limit": batch, "raw_json": 1}
        if sort in ("top", "controversial"):
            params["t"] = time_filter
        if after:
            params["after"] = after

        url = f"{_JSON_BASE}/r/{subreddit}/{sort}.json"
        resp = requests.get(url, headers=_HEADERS, params=params, timeout=30)
        if resp.status_code == 429:
            time.sleep(2)
            continue
        resp.raise_for_status()
        data = resp.json()

        children = data.get("data", {}).get("children", [])
        if not children:
            break

        for child in children:
            d = child.get("data", {})
            posts.append(
                RedditPost(
                    id=d.get("id", ""),
                    subreddit=d.get("subreddit", subreddit),
                    title=d.get("title", ""),
                    selftext=d.get("selftext", "") or "",
                    author=d.get("author", "") or "[deleted]",
                    score=int(d.get("score", 0)),
                    num_comments=int(d.get("num_comments", 0)),
                    upvote_ratio=float(d.get("upvote_ratio", 0.0)),
                    created_utc=float(d.get("created_utc", 0.0)),
                    permalink=_JSON_BASE + d.get("permalink", ""),
                    url=d.get("url", "") or "",
                    flair=d.get("link_flair_text", "") or "",
                )
            )

        after = data.get("data", {}).get("after")
        remaining -= len(children)
        if not after:
            break
        time.sleep(1)  # 礼貌限速，避免触发 429

    return posts[:limit]


# ----------------------------------------------------------------------------
# PRAW 数据源
# ----------------------------------------------------------------------------
_praw_reddit = None


def _get_praw():
    global _praw_reddit
    if _praw_reddit is None:
        import praw  # 延迟导入，未配置密钥时无需安装也能跑

        _praw_reddit = praw.Reddit(
            client_id=config.REDDIT_CLIENT_ID,
            client_secret=config.REDDIT_CLIENT_SECRET,
            user_agent=config.REDDIT_USER_AGENT,
            check_for_async=False,
        )
        _praw_reddit.read_only = True
    return _praw_reddit


def _fetch_via_praw(
    subreddit: str,
    sort: str,
    limit: int,
    time_filter: str,
) -> list[RedditPost]:
    reddit = _get_praw()
    sub = reddit.subreddit(subreddit)

    if sort == "hot":
        listing = sub.hot(limit=limit)
    elif sort == "new":
        listing = sub.new(limit=limit)
    elif sort == "rising":
        listing = sub.rising(limit=limit)
    elif sort == "controversial":
        listing = sub.controversial(time_filter=time_filter, limit=limit)
    else:  # top
        listing = sub.top(time_filter=time_filter, limit=limit)

    posts: list[RedditPost] = []
    for s in listing:
        posts.append(
            RedditPost(
                id=s.id,
                subreddit=str(s.subreddit),
                title=s.title or "",
                selftext=s.selftext or "",
                author=str(s.author) if s.author else "[deleted]",
                score=int(s.score),
                num_comments=int(s.num_comments),
                upvote_ratio=float(getattr(s, "upvote_ratio", 0.0)),
                created_utc=float(s.created_utc),
                permalink=_JSON_BASE + s.permalink,
                url=s.url or "",
                flair=s.link_flair_text or "",
            )
        )
    return posts


# ----------------------------------------------------------------------------
# 对外统一入口
# ----------------------------------------------------------------------------
def active_source() -> str:
    """返回当前生效的数据源名称，供 UI 展示。"""
    return "praw" if config.has_praw_credentials() else "json"


def fetch_posts(
    subreddits: Iterable[str],
    sort: str = "new",
    limit: int = 50,
    time_filter: str = "week",
) -> list[RedditPost]:
    """抓取一个或多个子版块的帖子。

    Args:
        subreddits: 子版块名列表（不含 r/ 前缀）
        sort: hot / new / top / rising / controversial
        limit: 每个子版块抓取的帖子数
        time_filter: 当 sort 为 top/controversial 时生效（hour/day/week/month/year/all）
    """
    use_praw = config.has_praw_credentials()
    fetch = _fetch_via_praw if use_praw else _fetch_via_json

    all_posts: list[RedditPost] = []
    seen: set[str] = set()
    for raw in subreddits:
        name = raw.strip().lstrip("r/").strip("/ ").strip()
        if not name:
            continue
        try:
            for post in fetch(name, sort, limit, time_filter):
                if post.id and post.id not in seen:
                    seen.add(post.id)
                    all_posts.append(post)
        except Exception as exc:  # 单个子版块失败不应中断整体
            print(f"[reddit] 抓取 r/{name} 失败: {exc}")
            if "403" in str(exc) and not use_praw:
                print(
                    "  提示：公开 JSON 接口可能在云服务器/数据中心 IP 上被 Reddit 拦截(403)。"
                    "请在本机运行，或配置 Reddit 密钥改用 PRAW（更稳定）。"
                )
    return all_posts
