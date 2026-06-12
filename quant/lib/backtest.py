# -*- coding: utf-8 -*-
"""
回测引擎（纯 Python）

回测 = 拿历史数据，假装“当时按策略交易”，看最后赚还是亏。
它是检验策略的第一道关卡。能通过回测不代表实盘一定赚，但回测就亏的策略，
实盘几乎必亏，所以这一步绝不能省。

本引擎特性：
  - 多头为主（long-only），可选允许做空（allow_short）
  - 考虑手续费（fee）和滑点（slippage），更接近真实
  - 信号在“当根收盘确认、下一根开盘成交”，避免“未来函数”作弊
  - 输出完整绩效指标 + 资金曲线 + 每笔交易记录
"""
from __future__ import annotations
from typing import List, Dict
import math


Bars = List[Dict]


def run(bars: Bars, signals: List[int], init_cash: float = 10000.0,
        fee: float = 0.0005, slippage: float = 0.0005,
        allow_short: bool = False) -> Dict:
    """执行回测。
    fee：单边手续费率（0.0005 = 万五，币安现货大致水平）
    slippage：滑点率，模拟成交价比理想价差一点
    返回一个 dict，包含绩效指标、资金曲线 equity、交易记录 trades。"""
    n = len(bars)
    cash = init_cash         # 可用现金
    units = 0.0              # 持有数量（>0 多头，<0 空头）
    entry_price = 0.0        # 开仓成交价
    entry_time = ""
    equity_curve: List[float] = []
    trades: List[Dict] = []
    cost = fee + slippage

    for i in range(n):
        price = bars[i]["close"]
        # 目标方向：用上一根的信号本根成交，避免“未来函数”作弊
        target = signals[i - 1] if i > 0 else 0
        if not allow_short and target < 0:
            target = 0

        cur_dir = 0 if units == 0 else (1 if units > 0 else -1)
        if target != cur_dir:
            # ① 先平掉现有仓位，把钱收回到 cash
            if units != 0:
                rec = _close(units, entry_price, price, cost, entry_time,
                             bars[i]["time"])
                cash += rec["cash_delta"]
                trades.append(rec["trade"])
                units = 0.0
            # ② 再按目标方向用全部现金开新仓
            if target > 0:                      # 开多：花现金买入
                exec_price = price * (1 + cost)
                units = cash / exec_price
                cash -= units * exec_price       # 全仓后 cash≈0
                entry_price = exec_price
                entry_time = bars[i]["time"]
            elif target < 0:                    # 开空：用现金作保证金
                exec_price = price * (1 - cost)
                units = -(cash / exec_price)
                entry_price = exec_price
                entry_time = bars[i]["time"]

        # 当前总权益 = 现金 + 持仓盈亏
        equity_curve.append(cash + _unrealized(units, entry_price, price))

    metrics = _metrics(bars, equity_curve, trades, init_cash)
    metrics.update({"equity": equity_curve, "trades": trades})
    return metrics


def _close(units: float, entry: float, price: float, cost: float,
           entry_time: str, exit_time: str) -> Dict:
    """平仓，返回回收到现金的增量 cash_delta 和这笔交易的记录。"""
    if units > 0:                       # 平多：卖出
        exit_price = price * (1 - cost)
        pnl = units * (exit_price - entry)
        ret_pct = (exit_price / entry - 1) * 100
        cash_delta = units * exit_price  # 卖出全部所得（开仓时 cash 已扣过）
        direction = "多"
    else:                               # 平空：买回
        qty = -units
        exit_price = price * (1 + cost)
        pnl = qty * (entry - exit_price)
        ret_pct = (entry / exit_price - 1) * 100
        cash_delta = pnl                 # 开空未动 cash，平仓只结算盈亏
        direction = "空"
    return {
        "cash_delta": cash_delta,
        "trade": {
            "entry_time": entry_time, "exit_time": exit_time,
            "direction": direction, "entry": entry, "exit": price,
            "return_pct": ret_pct, "pnl": pnl,
        },
    }


def _unrealized(units: float, entry: float, price: float) -> float:
    """持仓对权益的贡献：多头是市值，空头是浮动盈亏。"""
    if units == 0:
        return 0.0
    if units > 0:
        return units * price             # 多头：现金已扣，这里是持仓市值
    return (-units) * (entry - price)    # 空头：cash 未动，这里加浮动盈亏


def _metrics(bars: Bars, equity: List[float], trades: List[Dict],
             init_cash: float) -> Dict:
    if not equity:
        return {}
    final = equity[-1]
    total_return = (final / init_cash - 1) * 100

    # 买入持有基准
    bh_return = (bars[-1]["close"] / bars[0]["close"] - 1) * 100

    # 日收益序列
    rets = []
    for i in range(1, len(equity)):
        if equity[i - 1] > 0:
            rets.append(equity[i] / equity[i - 1] - 1)
    # 年化（按一年 252 个交易周期估算；币圈日线≈365 也够用做相对比较）
    periods = max(len(equity), 1)
    ann_factor = 252
    if periods > 1 and final > 0:
        ann_return = ((final / init_cash) ** (ann_factor / periods) - 1) * 100
    else:
        ann_return = 0.0

    # 夏普比率（无风险利率按 0 估算）
    sharpe = 0.0
    if len(rets) > 1:
        mean = sum(rets) / len(rets)
        var = sum((r - mean) ** 2 for r in rets) / (len(rets) - 1)
        std = math.sqrt(var)
        if std > 0:
            sharpe = (mean / std) * math.sqrt(ann_factor)

    # 最大回撤
    peak = equity[0]
    max_dd = 0.0
    for v in equity:
        if v > peak:
            peak = v
        dd = (peak - v) / peak if peak > 0 else 0
        if dd > max_dd:
            max_dd = dd
    max_dd *= 100

    # 交易统计
    wins = [t for t in trades if t["pnl"] > 0]
    win_rate = (len(wins) / len(trades) * 100) if trades else 0.0
    gross_win = sum(t["pnl"] for t in trades if t["pnl"] > 0)
    gross_loss = -sum(t["pnl"] for t in trades if t["pnl"] < 0)
    profit_factor = (gross_win / gross_loss) if gross_loss > 0 else float("inf")

    return {
        "init_cash": init_cash,
        "final_equity": final,
        "total_return_pct": total_return,
        "buy_hold_return_pct": bh_return,
        "annual_return_pct": ann_return,
        "sharpe": sharpe,
        "max_drawdown_pct": max_dd,
        "num_trades": len(trades),
        "win_rate_pct": win_rate,
        "profit_factor": profit_factor,
    }


def format_report(name: str, m: Dict) -> str:
    """把回测结果排版成易读的中文文字报告。"""
    pf = m.get("profit_factor", 0)
    pf_s = "∞" if pf == float("inf") else f"{pf:.2f}"
    lines = [
        "=" * 46,
        f"  策略：{name}",
        "=" * 46,
        f"  初始资金      : {m['init_cash']:,.0f}",
        f"  期末资金      : {m['final_equity']:,.0f}",
        f"  总收益率      : {m['total_return_pct']:+.2f}%",
        f"  同期买入持有  : {m['buy_hold_return_pct']:+.2f}%   (基准)",
        f"  年化收益率    : {m['annual_return_pct']:+.2f}%",
        f"  夏普比率      : {m['sharpe']:.2f}   (>1 不错, >2 优秀)",
        f"  最大回撤      : -{m['max_drawdown_pct']:.2f}%   (越小越稳)",
        f"  交易次数      : {m['num_trades']}",
        f"  胜率          : {m['win_rate_pct']:.1f}%",
        f"  盈亏比(PF)    : {pf_s}   (>1.5 较好)",
        "=" * 46,
    ]
    # 给个大白话结论
    verdict = _verdict(m)
    lines.append(f"  一句话点评：{verdict}")
    lines.append("=" * 46)
    return "\n".join(lines)


def _verdict(m: Dict) -> str:
    tr = m["total_return_pct"]
    bh = m["buy_hold_return_pct"]
    dd = m["max_drawdown_pct"]
    sharpe = m["sharpe"]
    if m["num_trades"] == 0:
        return "整个区间没有产生交易，换参数或换品种再试。"
    if tr <= 0:
        return "这套参数在该品种上是亏的，别用，换策略/参数或换品种。"
    if tr < bh:
        return "赚了，但跑输了“无脑买入持有”，性价比一般。"
    if sharpe > 1 and dd < 25:
        return "收益跑赢基准且回撤可控，是个值得继续研究的方向。"
    return "整体盈利，但回撤或稳定性一般，建议优化止损和仓位。"
