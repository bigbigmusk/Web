"""命令行入口：一条命令完成抓取 → 识别 → 导出 Excel。

适合配合系统 cron / GitHub Actions 做「全自动定时抓取」。

示例：
    python cli.py --subreddits SaaS Entrepreneur smallbusiness --sort new --limit 80
    python cli.py -s startups -s sideproject --no-ai          # 仅规则、零成本
"""
from __future__ import annotations

import argparse
import sys

import config
import excel_exporter
import scraper


def _print_progress(p: dict) -> None:
    print(f"  [{p['stage']}] {p['message']}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Reddit 商业机会爬虫 —— 抓取、识别并导出 Excel"
    )
    parser.add_argument(
        "-s",
        "--subreddits",
        nargs="+",
        required=True,
        help="一个或多个子版块名（不含 r/），如 SaaS Entrepreneur",
    )
    parser.add_argument(
        "--sort",
        default="new",
        choices=["hot", "new", "top", "rising", "controversial"],
        help="排序方式（默认 new）",
    )
    parser.add_argument(
        "--limit", type=int, default=50, help="每个子版块抓取条数（默认 50）"
    )
    parser.add_argument(
        "--time",
        dest="time_filter",
        default="week",
        choices=["hour", "day", "week", "month", "year", "all"],
        help="top/controversial 排序时的时间范围（默认 week）",
    )
    parser.add_argument(
        "--min-score",
        type=int,
        default=3,
        help="规则分达到该值才送 AI 精判（默认 3）",
    )
    parser.add_argument(
        "--max-ai",
        type=int,
        default=60,
        help="单次最多 AI 调用次数，控制成本（默认 60）",
    )
    parser.add_argument(
        "--no-ai", action="store_true", help="禁用 AI 精判，仅用规则识别"
    )
    parser.add_argument("-o", "--output", default=None, help="输出文件名（可选）")
    args = parser.parse_args(argv)

    use_ai = not args.no_ai
    if use_ai and not config.has_anthropic():
        print("⚠️  未配置 ANTHROPIC_API_KEY，自动回退为仅规则模式。")
        use_ai = False

    print(
        f"▶ 数据源：{'PRAW' if config.has_praw_credentials() else '公开JSON'}　"
        f"｜ AI 精判：{'开' if use_ai else '关'}"
    )

    result = scraper.run_scrape(
        args.subreddits,
        sort=args.sort,
        limit=args.limit,
        time_filter=args.time_filter,
        use_ai=use_ai,
        min_rule_score=args.min_score,
        max_ai_calls=args.max_ai,
        progress=_print_progress,
    )

    path = excel_exporter.export(
        result["records"], config.OUTPUT_DIR, filename=args.output
    )
    s = result["stats"]
    print(
        f"\n✅ 完成！抓取 {s['total_posts']} 条 → 候选 {s['candidates']} 个 → "
        f"机会 {s['opportunities']} 个"
    )
    print(f"📄 Excel 已保存：{path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
