#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
量化交易工具 · 一键入口（小白友好，菜单式操作）

怎么用？打开终端/命令行，进入本文件夹，运行：
    python3 run.py
然后按提示输入数字选择即可。零基础也能上手。

也支持命令行直接调用（进阶）：
    python3 run.py backtest crypto BTCUSDT ma_cross
    python3 run.py scan
    python3 run.py demo            # 离线演示，无需联网

⚠️ 风险提示：金融市场有风险，本工具仅用于学习和研究，不构成任何投资建议。
   任何策略实盘前请务必小资金验证、严格止损。
"""
from __future__ import annotations
import os
import sys

# 让脚本无论在哪儿运行都能找到 lib 包
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import data, strategy, backtest, report, scanner  # noqa: E402

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")


# ---------------------------- 取数据 ----------------------------
def get_bars(market: str, symbol: str):
    """根据市场类型获取行情，失败则回退到离线模拟数据。"""
    market = market.lower()
    try:
        if market in ("crypto", "币圈", "c"):
            return data.fetch_crypto(symbol)
        if market in ("us", "美股", "u"):
            return data.fetch_us(symbol)
        if market in ("cn", "a股", "a"):
            return data.fetch_cn(symbol)
        if market in ("csv", "文件"):
            return data.load_csv(symbol)
        if market in ("demo", "模拟"):
            return data.synthetic()
    except Exception as e:
        print(f"\n⚠️ 在线获取失败：{e}")
        print("   → 自动改用离线模拟数据，让你先把流程跑通。\n")
        return data.synthetic()
    return data.synthetic()


# ---------------------------- 回测 ----------------------------
def do_backtest(market: str, symbol: str, strat_name: str, **params):
    bars = get_bars(market, symbol)
    if len(bars) < 40:
        print("数据太少，无法回测。"); return
    fn, default_params, desc = strategy.get_strategy(strat_name)
    p = {**default_params, **params}
    signals = fn(bars, **p)
    allow_short = market.lower() in ("crypto", "币圈", "c", "us", "美股", "u")
    m = backtest.run(bars, signals, allow_short=False)

    title = f"{symbol} · {desc}"
    print("\n" + backtest.format_report(title, m))

    os.makedirs(OUT_DIR, exist_ok=True)
    safe = symbol.replace("/", "_").replace(":", "_")
    out = os.path.join(OUT_DIR, f"{safe}_{strat_name}.html")
    report.generate(out, title, bars, signals, m)
    print(f"\n📊 可视化报告已生成：{out}")
    print("   用浏览器打开它，能看到价格走势、买卖点和资金曲线。")
    return m


def compare_strategies(market: str, symbol: str):
    """同一品种，把所有策略跑一遍做横向对比。"""
    bars = get_bars(market, symbol)
    if len(bars) < 40:
        print("数据太少。"); return
    print(f"\n品种：{symbol}    数据：{len(bars)} 根 K 线 "
          f"（{bars[0]['time']} ~ {bars[-1]['time']}）")
    print(f"买入持有基准收益："
          f"{(bars[-1]['close']/bars[0]['close']-1)*100:+.2f}%\n")
    print(f"{'策略':<24}{'总收益':>10}{'年化':>9}{'回撤':>9}"
          f"{'夏普':>7}{'胜率':>8}{'交易':>6}")
    print("-" * 74)
    best = None
    for key, (fn, params, desc) in strategy.REGISTRY.items():
        sig = fn(bars, **params)
        m = backtest.run(bars, sig)
        print(f"{desc:<24}{m['total_return_pct']:>9.1f}%"
              f"{m['annual_return_pct']:>8.1f}%"
              f"{-m['max_drawdown_pct']:>8.1f}%"
              f"{m['sharpe']:>7.2f}{m['win_rate_pct']:>7.0f}%"
              f"{m['num_trades']:>6}")
        if best is None or m['total_return_pct'] > best[1]:
            best = (desc, m['total_return_pct'])
    print("-" * 74)
    if best:
        print(f"本品种历史表现最好的是：{best[0]}（{best[1]:+.1f}%）")
    print("注意：历史最优 ≠ 未来最优，切勿盲目照搬。\n")


# ---------------------------- 扫描 ----------------------------
DEFAULT_WATCH = {
    "crypto": ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
    "us": ["AAPL", "NVDA", "TSLA"],
}


def do_scan(market: str = "crypto", symbols=None):
    symbols = symbols or DEFAULT_WATCH.get(market, ["BTCUSDT"])
    print(f"\n=== 实时信号扫描（{market}）===")
    for s in symbols:
        bars = get_bars(market, s)
        if len(bars) < 40:
            print(f"{s}: 数据不足，跳过"); continue
        snap = scanner.scan_one(s, bars)
        print()
        print(scanner.format_scan(snap))
    print("\n提示：'今日刚变' 的信号最值得关注，但请结合大盘和自己的判断。\n")


# ---------------------------- 菜单 ----------------------------
MENU = """
╔══════════════════════════════════════════════╗
║         量化交易工具  ·  主菜单                ║
╠══════════════════════════════════════════════╣
║  1. 回测单个策略（看一套策略历史赚不赚）       ║
║  2. 策略横向对比（同一品种比所有策略）         ║
║  3. 实时信号扫描（现在该买/该卖/该等？）       ║
║  4. 离线演示（无需联网，先跑通流程）           ║
║  0. 退出                                       ║
╚══════════════════════════════════════════════╝"""

MARKET_MENU = "选择市场： 1=币圈  2=美股  3=A股  4=本地CSV文件 > "
MARKET_MAP = {"1": "crypto", "2": "us", "3": "cn", "4": "csv"}
STRAT_LIST = list(strategy.REGISTRY.items())


def ask_market_symbol():
    mk = MARKET_MAP.get(input(MARKET_MENU).strip(), "crypto")
    hint = {"crypto": "如 BTCUSDT、ETHUSDT", "us": "如 AAPL、NVDA、TSLA",
            "cn": "如 sh600519、sz000001、sh000001", "csv": "CSV 文件路径"}[mk]
    sym = input(f"输入代码（{hint}）> ").strip() or {
        "crypto": "BTCUSDT", "us": "AAPL", "cn": "sh000001", "csv": "examples/sample.csv"
    }[mk]
    return mk, sym


def interactive():
    print("\n欢迎使用量化交易工具！（输入数字 + 回车操作）")
    while True:
        print(MENU)
        choice = input("请选择 > ").strip()
        if choice == "0":
            print("再见，理性投资，注意风险 👋"); break
        elif choice == "1":
            mk, sym = ask_market_symbol()
            print("\n选择策略：")
            for i, (k, (_, _, desc)) in enumerate(STRAT_LIST, 1):
                print(f"  {i}. {desc}")
            si = input("策略编号 > ").strip()
            try:
                key = STRAT_LIST[int(si) - 1][0]
            except (ValueError, IndexError):
                key = "ma_cross"
            do_backtest(mk, sym, key)
        elif choice == "2":
            mk, sym = ask_market_symbol()
            compare_strategies(mk, sym)
        elif choice == "3":
            mk = MARKET_MAP.get(input("市场 1=币圈 2=美股 > ").strip(), "crypto")
            do_scan(mk)
        elif choice == "4":
            print("\n[离线演示] 用模拟数据跑‘双均线’策略 + 横向对比：")
            compare_strategies("demo", "模拟币")
            do_backtest("demo", "模拟币", "ma_cross")
        else:
            print("没听懂，请输入菜单里的数字。")


# ---------------------------- CLI ----------------------------
def main():
    args = sys.argv[1:]
    if not args:
        interactive(); return
    cmd = args[0].lower()
    if cmd == "backtest" and len(args) >= 4:
        do_backtest(args[1], args[2], args[3])
    elif cmd == "compare" and len(args) >= 3:
        compare_strategies(args[1], args[2])
    elif cmd == "scan":
        do_scan(args[1] if len(args) > 1 else "crypto")
    elif cmd == "demo":
        compare_strategies("demo", "模拟币")
        do_backtest("demo", "模拟币", "ma_cross")
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
