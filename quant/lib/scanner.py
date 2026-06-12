# -*- coding: utf-8 -*-
"""
实时信号扫描器：给一组关注的品种，算出“此刻”各策略给的信号。

它回答的是：“现在这个币/这只股，按某策略该买、该卖还是该等？”
注意：这只是工具给的机械信号，最终决策永远是你自己的，且必须配合止损。
"""
from __future__ import annotations
from typing import List, Dict
from . import indicators as ind
from . import strategy as strat


def scan_one(name: str, bars: List[Dict]) -> Dict:
    """对单个品种，跑一遍所有策略，给出当前信号和关键指标快照。"""
    closes = [b["close"] for b in bars]
    last = closes[-1]
    prev = closes[-2] if len(closes) > 1 else last
    chg = (last / prev - 1) * 100 if prev else 0.0

    rsi_v = ind.rsi(closes, 14)[-1]
    ma_fast = ind.sma(closes, 10)[-1]
    ma_slow = ind.sma(closes, 30)[-1]

    results = {}
    for key, (fn, params, desc) in strat.REGISTRY.items():
        sig = fn(bars, **params)
        # 当前信号，以及是否“今天刚变化”（更值得关注）
        cur = sig[-1]
        changed = len(sig) > 1 and sig[-1] != sig[-2]
        results[key] = {"signal": cur, "changed": changed, "desc": desc}

    return {
        "name": name, "price": last, "change_pct": chg,
        "rsi": rsi_v, "ma_fast": ma_fast, "ma_slow": ma_slow,
        "strategies": results,
    }


def format_scan(snap: Dict) -> str:
    """把单个品种的扫描结果排版成一行行中文。"""
    def sig_text(v):
        return {1: "🟢买入/持有", 0: "⚪观望/空仓", -1: "🔴做空"}.get(v, "?")

    lines = []
    rsi_s = f"{snap['rsi']:.0f}" if snap['rsi'] is not None else "—"
    lines.append(f"【{snap['name']}】 现价 {snap['price']:.4f}  "
                 f"涨跌 {snap['change_pct']:+.2f}%  RSI {rsi_s}")
    trend = "多头排列↑" if (snap['ma_fast'] and snap['ma_slow']
                          and snap['ma_fast'] > snap['ma_slow']) else "空头排列↓"
    lines.append(f"   均线：{trend}")
    for key, r in snap["strategies"].items():
        flag = "  ← 今日刚变!" if r["changed"] else ""
        lines.append(f"   {r['desc']:<22} → {sig_text(r['signal'])}{flag}")
    return "\n".join(lines)
