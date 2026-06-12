"""集中读取环境变量与默认配置。"""
import os

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # python-dotenv 未安装时也能运行，依赖系统环境变量
    pass


# ---- Claude AI ----
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
# 默认使用最新最强的 Opus 模型做精判
AI_MODEL = os.getenv("AI_MODEL", "claude-opus-4-8").strip()

# ---- Reddit PRAW ----
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "").strip()
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "").strip()
REDDIT_USER_AGENT = os.getenv(
    "REDDIT_USER_AGENT", "opportunity-scraper/1.0 (by /u/unknown)"
).strip()

# ---- Web / 输出 ----
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "output").strip()
PORT = int(os.getenv("PORT", "5000"))


def has_anthropic() -> bool:
    return bool(ANTHROPIC_API_KEY)


def has_praw_credentials() -> bool:
    return bool(REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET)
