# -*- coding: utf-8 -*-
"""
技术指标库（纯 Python 实现，零第三方依赖）

每个函数接收一个收盘价列表 closes（list[float]），返回一个等长的指标列表，
前面数据不足的位置用 None 占位，方便和原始 K 线一一对应。

小白须知：技术指标只是把价格做了数学变换，帮助你“看图说话”，
它不能预测未来，只能描述过去和当下。请永远配合仓位管理和止损使用。
"""
from __future__ import annotations
from typing import List, Optional, Tuple


def sma(values: List[float], period: int) -> List[Optional[float]]:
    """简单移动平均（SMA / MA）：最近 period 根的算术平均。"""
    out: List[Optional[float]] = [None] * len(values)
    if period <= 0:
        return out
    run = 0.0
    for i, v in enumerate(values):
        run += v
        if i >= period:
            run -= values[i - period]
        if i >= period - 1:
            out[i] = run / period
    return out


def ema(values: List[float], period: int) -> List[Optional[float]]:
    """指数移动平均（EMA）：越近的价格权重越大，比 SMA 更灵敏。"""
    out: List[Optional[float]] = [None] * len(values)
    if period <= 0 or len(values) < period:
        return out
    k = 2.0 / (period + 1)
    # 用前 period 根的 SMA 作为种子，避免初值偏差
    seed = sum(values[:period]) / period
    out[period - 1] = seed
    prev = seed
    for i in range(period, len(values)):
        prev = values[i] * k + prev * (1 - k)
        out[i] = prev
    return out


def rsi(closes: List[float], period: int = 14) -> List[Optional[float]]:
    """相对强弱指标（RSI），范围 0~100。
    >70 常被视为超买（涨多了），<30 常被视为超卖（跌多了）。"""
    out: List[Optional[float]] = [None] * len(closes)
    if len(closes) <= period:
        return out
    gains = 0.0
    losses = 0.0
    for i in range(1, period + 1):
        ch = closes[i] - closes[i - 1]
        gains += max(ch, 0.0)
        losses += max(-ch, 0.0)
    avg_gain = gains / period
    avg_loss = losses / period
    out[period] = _rsi_value(avg_gain, avg_loss)
    for i in range(period + 1, len(closes)):
        ch = closes[i] - closes[i - 1]
        gain = max(ch, 0.0)
        loss = max(-ch, 0.0)
        avg_gain = (avg_gain * (period - 1) + gain) / period
        avg_loss = (avg_loss * (period - 1) + loss) / period
        out[i] = _rsi_value(avg_gain, avg_loss)
    return out


def _rsi_value(avg_gain: float, avg_loss: float) -> float:
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100.0 - 100.0 / (1.0 + rs)


def macd(closes: List[float], fast: int = 12, slow: int = 26, signal: int = 9
         ) -> Tuple[List[Optional[float]], List[Optional[float]], List[Optional[float]]]:
    """MACD：快线 - 慢线 = DIF；DIF 的 EMA = DEA；柱状图 = (DIF-DEA)*2。
    金叉（DIF 上穿 DEA）偏多，死叉（DIF 下穿 DEA）偏空。"""
    ema_fast = ema(closes, fast)
    ema_slow = ema(closes, slow)
    dif: List[Optional[float]] = [None] * len(closes)
    for i in range(len(closes)):
        if ema_fast[i] is not None and ema_slow[i] is not None:
            dif[i] = ema_fast[i] - ema_slow[i]
    # 对 dif 中非 None 段求 EMA 得到 dea
    dea: List[Optional[float]] = [None] * len(closes)
    valid = [(i, v) for i, v in enumerate(dif) if v is not None]
    if len(valid) >= signal:
        vals = [v for _, v in valid]
        dea_vals = ema(vals, signal)
        for (orig_i, _), d in zip(valid, dea_vals):
            dea[orig_i] = d
    hist: List[Optional[float]] = [None] * len(closes)
    for i in range(len(closes)):
        if dif[i] is not None and dea[i] is not None:
            hist[i] = (dif[i] - dea[i]) * 2.0
    return dif, dea, hist


def bollinger(closes: List[float], period: int = 20, num_std: float = 2.0
              ) -> Tuple[List[Optional[float]], List[Optional[float]], List[Optional[float]]]:
    """布林带：中轨=MA，上下轨=中轨 ± num_std 倍标准差。
    价格触上轨偏强/超买，触下轨偏弱/超卖，带宽收窄常预示变盘。"""
    mid = sma(closes, period)
    upper: List[Optional[float]] = [None] * len(closes)
    lower: List[Optional[float]] = [None] * len(closes)
    for i in range(period - 1, len(closes)):
        window = closes[i - period + 1:i + 1]
        m = mid[i]
        var = sum((x - m) ** 2 for x in window) / period
        sd = var ** 0.5
        upper[i] = m + num_std * sd
        lower[i] = m - num_std * sd
    return upper, mid, lower


def atr(highs: List[float], lows: List[float], closes: List[float], period: int = 14
        ) -> List[Optional[float]]:
    """平均真实波幅（ATR）：衡量波动大小，常用来设置止损距离。"""
    n = len(closes)
    out: List[Optional[float]] = [None] * n
    if n <= period:
        return out
    trs: List[float] = [0.0] * n
    for i in range(1, n):
        tr = max(highs[i] - lows[i],
                 abs(highs[i] - closes[i - 1]),
                 abs(lows[i] - closes[i - 1]))
        trs[i] = tr
    first = sum(trs[1:period + 1]) / period
    out[period] = first
    prev = first
    for i in range(period + 1, n):
        prev = (prev * (period - 1) + trs[i]) / period
        out[i] = prev
    return out


def crossover(a: List[Optional[float]], b: List[Optional[float]], i: int) -> int:
    """判断第 i 根 K 线上 a 与 b 的交叉：
    返回 1 表示 a 上穿 b（金叉），-1 表示 a 下穿 b（死叉），0 表示无交叉。"""
    if i == 0:
        return 0
    pa, pb = a[i - 1], b[i - 1]
    ca, cb = a[i], b[i]
    if None in (pa, pb, ca, cb):
        return 0
    if pa <= pb and ca > cb:
        return 1
    if pa >= pb and ca < cb:
        return -1
    return 0
