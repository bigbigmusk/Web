# -*- coding: utf-8 -*-
"""
交易策略库（教学用，结构简单清晰，方便你照葫芦画瓢改成自己的策略）

每个策略是一个函数：输入 bars（K线列表），输出 signals（信号列表，等长）。
信号约定：
    1  = 做多 / 持有多头（看涨）
    0  = 空仓 / 观望
   -1  = 做空（仅在支持做空的回测里有效，币圈合约/美股可做空，A股一般不能）

小白提示：下面每个策略都是“经典入门策略”，目的是让你理解机制，
不是稳赚的圣杯。任何策略都要先回测、再用小资金实盘验证。
"""
from __future__ import annotations
from typing import List, Dict
from . import indicators as ind


Bars = List[Dict]
Signals = List[int]


def ma_cross(bars: Bars, fast: int = 10, slow: int = 30) -> Signals:
    """双均线交叉：快线在慢线之上做多，之下空仓。
    最经典的趋势跟踪策略，适合有明显趋势的品种。"""
    closes = [b["close"] for b in bars]
    f = ind.sma(closes, fast)
    s = ind.sma(closes, slow)
    sig = [0] * len(bars)
    for i in range(len(bars)):
        if f[i] is None or s[i] is None:
            continue
        sig[i] = 1 if f[i] > s[i] else 0
    return sig


def rsi_reversion(bars: Bars, period: int = 14, low: float = 30, high: float = 70) -> Signals:
    """RSI 均值回归：超卖（RSI<low）买入，超买（RSI>high）卖出。
    适合震荡行情，单边大趋势里会吃亏，注意搭配止损。"""
    closes = [b["close"] for b in bars]
    r = ind.rsi(closes, period)
    sig = [0] * len(bars)
    holding = 0
    for i in range(len(bars)):
        if r[i] is None:
            sig[i] = holding
            continue
        if r[i] < low:
            holding = 1
        elif r[i] > high:
            holding = 0
        sig[i] = holding
    return sig


def macd_trend(bars: Bars, fast: int = 12, slow: int = 26, signal: int = 9) -> Signals:
    """MACD 趋势：DIF 上穿 DEA（金叉）做多，下穿（死叉）空仓。"""
    closes = [b["close"] for b in bars]
    dif, dea, _ = ind.macd(closes, fast, slow, signal)
    sig = [0] * len(bars)
    holding = 0
    for i in range(len(bars)):
        c = ind.crossover(dif, dea, i)
        if c == 1:
            holding = 1
        elif c == -1:
            holding = 0
        sig[i] = holding
    return sig


def bollinger_breakout(bars: Bars, period: int = 20, num_std: float = 2.0) -> Signals:
    """布林带突破：收盘上破上轨做多（动量突破），跌破中轨离场。"""
    closes = [b["close"] for b in bars]
    upper, mid, _ = ind.bollinger(closes, period, num_std)
    sig = [0] * len(bars)
    holding = 0
    for i in range(len(bars)):
        if upper[i] is None:
            sig[i] = holding
            continue
        if closes[i] > upper[i]:
            holding = 1
        elif closes[i] < mid[i]:
            holding = 0
        sig[i] = holding
    return sig


# 策略注册表：名字 -> (函数, 默认参数, 中文说明)
REGISTRY = {
    "ma_cross": (ma_cross, {"fast": 10, "slow": 30}, "双均线交叉（趋势跟踪，最经典）"),
    "rsi": (rsi_reversion, {"period": 14, "low": 30, "high": 70}, "RSI 均值回归（适合震荡）"),
    "macd": (macd_trend, {"fast": 12, "slow": 26, "signal": 9}, "MACD 金叉死叉（趋势）"),
    "boll": (bollinger_breakout, {"period": 20, "num_std": 2.0}, "布林带突破（动量）"),
}


def get_strategy(name: str):
    if name not in REGISTRY:
        raise KeyError(f"未知策略 '{name}'，可选：{list(REGISTRY.keys())}")
    return REGISTRY[name]
