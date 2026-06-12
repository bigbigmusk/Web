# -*- coding: utf-8 -*-
"""
行情数据获取模块（纯标准库 urllib，零第三方依赖）

支持的市场与免费数据源（无需 API Key）：
  - 币圈（crypto）：币安 Binance，失败自动切换到 OKX
  - 美股（us）   ：雅虎财经 Yahoo Finance，失败切换到 Stooq
  - A股（cn）    ：腾讯证券日线接口

另外支持：
  - 本地 CSV 文件导入（万能后备，任何行情软件导出的数据都能用）
  - 离线模拟数据（synthetic，用于无网络环境下测试和学习）

返回统一的数据结构：bars = list[dict]，每个元素：
  {"time": "2024-01-01", "open": .., "high": .., "low": .., "close": .., "volume": ..}
"""
from __future__ import annotations
import json
import csv as _csv
import math
import random
import urllib.request
import urllib.parse
from typing import List, Dict, Optional

_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) quant-tool/1.0"
Bars = List[Dict]


def _http_get(url: str, timeout: int = 12) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": _UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


# ----------------------------- 币圈 -----------------------------
def fetch_crypto(symbol: str = "BTCUSDT", interval: str = "1d", limit: int = 365) -> Bars:
    """获取加密货币 K 线。symbol 例如 BTCUSDT、ETHUSDT、SOLUSDT。
    interval：1m/5m/15m/1h/4h/1d/1w。"""
    symbol = symbol.upper().replace("-", "").replace("/", "")
    try:
        return _binance(symbol, interval, limit)
    except Exception as e1:
        try:
            return _okx(symbol, interval, limit)
        except Exception as e2:
            raise RuntimeError(f"币圈数据获取失败（币安：{e1}；OKX：{e2}）。"
                               f"可改用 CSV 导入或离线模拟数据。")


def _binance(symbol: str, interval: str, limit: int) -> Bars:
    url = (f"https://api.binance.com/api/v3/klines?symbol={symbol}"
           f"&interval={interval}&limit={min(limit, 1000)}")
    raw = json.loads(_http_get(url))
    bars: Bars = []
    for k in raw:
        bars.append({
            "time": _ms_to_date(k[0]),
            "open": float(k[1]), "high": float(k[2]),
            "low": float(k[3]), "close": float(k[4]), "volume": float(k[5]),
        })
    return bars


_OKX_BAR = {"1m": "1m", "5m": "5m", "15m": "15m", "1h": "1H",
            "4h": "4H", "1d": "1D", "1w": "1W"}


def _okx(symbol: str, interval: str, limit: int) -> Bars:
    # OKX 用 BTC-USDT 这种带连字符的格式
    if symbol.endswith("USDT"):
        inst = symbol[:-4] + "-USDT"
    else:
        inst = symbol
    bar = _OKX_BAR.get(interval, "1D")
    url = (f"https://www.okx.com/api/v5/market/candles?instId={inst}"
           f"&bar={bar}&limit={min(limit, 300)}")
    data = json.loads(_http_get(url))["data"]
    bars: Bars = []
    for k in reversed(data):  # OKX 返回是倒序的
        bars.append({
            "time": _ms_to_date(int(k[0])),
            "open": float(k[1]), "high": float(k[2]),
            "low": float(k[3]), "close": float(k[4]), "volume": float(k[5]),
        })
    return bars


# ----------------------------- 美股 -----------------------------
def fetch_us(symbol: str = "AAPL", rng: str = "1y", interval: str = "1d") -> Bars:
    """获取美股 / ETF K 线。symbol 例如 AAPL、TSLA、NVDA、SPY、QQQ。
    rng：1mo/3mo/6mo/1y/2y/5y/max；interval：1d/1wk/1mo。"""
    try:
        return _yahoo(symbol, rng, interval)
    except Exception as e1:
        try:
            return _stooq(symbol)
        except Exception as e2:
            raise RuntimeError(f"美股数据获取失败（雅虎：{e1}；Stooq：{e2}）。")


def _yahoo(symbol: str, rng: str, interval: str) -> Bars:
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
           f"?range={rng}&interval={interval}")
    j = json.loads(_http_get(url))
    res = j["chart"]["result"][0]
    ts = res["timestamp"]
    q = res["indicators"]["quote"][0]
    bars: Bars = []
    for i, t in enumerate(ts):
        if q["close"][i] is None:
            continue
        bars.append({
            "time": _ts_to_date(t),
            "open": _f(q["open"][i]), "high": _f(q["high"][i]),
            "low": _f(q["low"][i]), "close": _f(q["close"][i]),
            "volume": _f(q["volume"][i]),
        })
    return bars


def _stooq(symbol: str) -> Bars:
    url = f"https://stooq.com/q/d/l/?s={symbol.lower()}.us&i=d"
    text = _http_get(url)
    return _parse_csv_text(text)


# ----------------------------- A股 -----------------------------
def fetch_cn(symbol: str = "sh000001", count: int = 365) -> Bars:
    """获取 A 股 / 指数日线。symbol 例如：
    sh000001（上证指数）、sz399001（深证成指）、sh600519（贵州茅台）、sz000001（平安银行）。"""
    url = (f"https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?"
           f"param={symbol},day,,,{min(count, 800)},qfq")
    j = json.loads(_http_get(url))
    node = j["data"][symbol]
    kline = node.get("qfqday") or node.get("day")
    bars: Bars = []
    for k in kline:
        bars.append({
            "time": k[0],
            "open": float(k[1]), "close": float(k[2]),
            "high": float(k[3]), "low": float(k[4]),
            "volume": float(k[5]) if len(k) > 5 else 0.0,
        })
    return bars


# ----------------------------- CSV -----------------------------
def load_csv(path: str) -> Bars:
    """从本地 CSV 文件读取行情。要求包含表头，列名（不区分大小写）至少有：
    date/time, open, high, low, close，可选 volume。"""
    with open(path, "r", encoding="utf-8-sig") as f:
        return _parse_csv_text(f.read())


def _parse_csv_text(text: str) -> Bars:
    reader = _csv.reader(text.strip().splitlines())
    rows = list(reader)
    if not rows:
        return []
    header = [h.strip().lower() for h in rows[0]]

    def idx(*names):
        for n in names:
            if n in header:
                return header.index(n)
        return None

    i_date = idx("date", "time", "datetime", "日期")
    i_open = idx("open", "开盘")
    i_high = idx("high", "最高")
    i_low = idx("low", "最低")
    i_close = idx("close", "adj close", "收盘")
    i_vol = idx("volume", "vol", "成交量")
    bars: Bars = []
    for r in rows[1:]:
        if not r or len(r) <= max(x for x in [i_date, i_close] if x is not None):
            continue
        try:
            close = float(r[i_close])
        except (ValueError, TypeError):
            continue
        bars.append({
            "time": r[i_date] if i_date is not None else str(len(bars)),
            "open": float(r[i_open]) if i_open is not None and r[i_open] else close,
            "high": float(r[i_high]) if i_high is not None and r[i_high] else close,
            "low": float(r[i_low]) if i_low is not None and r[i_low] else close,
            "close": close,
            "volume": float(r[i_vol]) if i_vol is not None and r[i_vol] else 0.0,
        })
    return bars


def save_csv(bars: Bars, path: str) -> None:
    """把行情保存成 CSV，方便离线复用。"""
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = _csv.writer(f)
        w.writerow(["date", "open", "high", "low", "close", "volume"])
        for b in bars:
            w.writerow([b["time"], b["open"], b["high"], b["low"], b["close"], b["volume"]])


# --------------------------- 离线模拟 ---------------------------
def synthetic(n: int = 365, start: float = 100.0, vol: float = 0.02,
              drift: float = 0.0004, seed: Optional[int] = 42) -> Bars:
    """生成模拟行情（几何布朗运动）。无网络时用来测试和学习，不代表真实市场。"""
    if seed is not None:
        random.seed(seed)
    bars: Bars = []
    price = start
    for i in range(n):
        ret = drift + vol * random.gauss(0, 1)
        new = max(price * (1 + ret), 0.01)
        o = price
        c = new
        hi = max(o, c) * (1 + abs(random.gauss(0, vol / 2)))
        lo = min(o, c) * (1 - abs(random.gauss(0, vol / 2)))
        bars.append({
            "time": f"D{i + 1:04d}",
            "open": round(o, 2), "high": round(hi, 2),
            "low": round(lo, 2), "close": round(c, 2),
            "volume": round(random.uniform(1e6, 5e6), 0),
        })
        price = new
    return bars


# ----------------------------- 工具 -----------------------------
def closes(bars: Bars) -> List[float]:
    return [b["close"] for b in bars]


def highs(bars: Bars) -> List[float]:
    return [b["high"] for b in bars]


def lows(bars: Bars) -> List[float]:
    return [b["low"] for b in bars]


def times(bars: Bars) -> List[str]:
    return [b["time"] for b in bars]


def _f(v) -> float:
    return float(v) if v is not None else 0.0


def _ms_to_date(ms: int) -> str:
    import datetime
    return datetime.datetime.utcfromtimestamp(ms / 1000).strftime("%Y-%m-%d")


def _ts_to_date(ts: int) -> str:
    import datetime
    return datetime.datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d")
