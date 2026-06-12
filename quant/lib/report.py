# -*- coding: utf-8 -*-
"""
HTML 可视化报告生成器（无需 matplotlib，用浏览器直接看）

生成一个自包含的 .html 文件，双击就能用浏览器打开，里面有：
  - 价格走势 + 买卖点
  - 资金曲线 vs 买入持有基准
  - 关键绩效指标卡片
图表用 Chart.js（从 CDN 加载，需要联网；离线时图表区会提示，但指标依然可读）。
"""
from __future__ import annotations
from typing import List, Dict
import json


def generate(path: str, title: str, bars: List[Dict], signals: List[int],
             metrics: Dict) -> None:
    times = [b["time"] for b in bars]
    closes = [b["close"] for b in bars]
    equity = metrics.get("equity", [])
    init_cash = metrics.get("init_cash", 10000)
    # 买入持有基准曲线（同样起始资金）
    bh = [init_cash * (c / closes[0]) for c in closes] if closes else []

    # 买卖点：信号从 0->1 标记买入，1->0 标记卖出
    buys_x, buys_y, sells_x, sells_y = [], [], [], []
    for i in range(1, len(signals)):
        if signals[i - 1] <= 0 and signals[i] > 0:
            buys_x.append(times[i]); buys_y.append(closes[i])
        elif signals[i - 1] > 0 and signals[i] <= 0:
            sells_x.append(times[i]); sells_y.append(closes[i])

    pf = metrics.get("profit_factor", 0)
    pf_s = "∞" if pf == float("inf") else f"{pf:.2f}"
    cards = [
        ("总收益率", f"{metrics.get('total_return_pct', 0):+.2f}%",
         metrics.get('total_return_pct', 0) >= 0),
        ("买入持有基准", f"{metrics.get('buy_hold_return_pct', 0):+.2f}%", None),
        ("年化收益", f"{metrics.get('annual_return_pct', 0):+.2f}%",
         metrics.get('annual_return_pct', 0) >= 0),
        ("最大回撤", f"-{metrics.get('max_drawdown_pct', 0):.2f}%", False),
        ("夏普比率", f"{metrics.get('sharpe', 0):.2f}", metrics.get('sharpe', 0) >= 1),
        ("胜率", f"{metrics.get('win_rate_pct', 0):.1f}%", None),
        ("交易次数", f"{metrics.get('num_trades', 0)}", None),
        ("盈亏比", pf_s, None),
    ]
    cards_html = "".join(
        f'<div class="card {_cls(good)}"><div class="v">{val}</div>'
        f'<div class="l">{label}</div></div>'
        for label, val, good in cards
    )

    data = {
        "times": times, "closes": closes, "equity": equity, "bh": bh,
        "buys": {"x": buys_x, "y": buys_y},
        "sells": {"x": sells_x, "y": sells_y},
    }
    html = _TEMPLATE.replace("__TITLE__", _esc(title)) \
                    .replace("__CARDS__", cards_html) \
                    .replace("__DATA__", json.dumps(data))
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)


def _cls(good):
    if good is None:
        return "neutral"
    return "good" if good else "bad"


def _esc(s: str) -> str:
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


_TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__ - 量化回测报告</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
  body{font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
       margin:0;background:#0d1117;color:#e6edf3;padding:24px;}
  h1{font-size:20px;margin:0 0 4px;}
  .sub{color:#8b949e;font-size:13px;margin-bottom:20px;}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
         gap:12px;margin-bottom:24px;}
  .card{background:#161b22;border:1px solid #30363d;border-radius:10px;
        padding:14px 16px;}
  .card .v{font-size:22px;font-weight:700;}
  .card .l{font-size:12px;color:#8b949e;margin-top:4px;}
  .good .v{color:#3fb950;} .bad .v{color:#f85149;} .neutral .v{color:#e6edf3;}
  .chart-box{background:#161b22;border:1px solid #30363d;border-radius:10px;
             padding:16px;margin-bottom:20px;}
  .chart-box h3{margin:0 0 12px;font-size:14px;color:#c9d1d9;}
  canvas{max-height:340px;}
  .tip{color:#8b949e;font-size:12px;margin-top:24px;line-height:1.7;
       border-top:1px solid #30363d;padding-top:16px;}
</style>
</head>
<body>
  <h1>__TITLE__</h1>
  <div class="sub">量化策略回测报告 · 由本地量化工具生成</div>
  <div class="cards">__CARDS__</div>
  <div class="chart-box"><h3>① 价格走势与买卖点（▲买 ▼卖）</h3>
    <canvas id="priceChart"></canvas></div>
  <div class="chart-box"><h3>② 资金曲线 vs 买入持有基准</h3>
    <canvas id="equityChart"></canvas></div>
  <div class="tip">
    ⚠️ 风险提示：回测基于历史数据，<b>不代表未来收益</b>。任何策略实盘前请用小资金验证，
    严格设置止损，单笔风险不超过本金的 1~2%。本工具仅供学习研究，不构成投资建议。
  </div>
<script>
const D = __DATA__;
const gridColor = "rgba(255,255,255,0.06)";
Chart.defaults.color = "#8b949e";
Chart.defaults.font.family = "system-ui";

function ptData(xs, ys){ return xs.map((x,i)=>({x:x,y:ys[i]})); }

new Chart(document.getElementById("priceChart"), {
  type:"line",
  data:{ labels:D.times, datasets:[
    {label:"收盘价", data:D.closes, borderColor:"#58a6ff", borderWidth:1.4,
     pointRadius:0, tension:0.1},
    {label:"买入", type:"scatter", data:ptData(D.buys.x,D.buys.y),
     pointStyle:"triangle", radius:9, backgroundColor:"#3fb950", borderColor:"#3fb950"},
    {label:"卖出", type:"scatter", data:ptData(D.sells.x,D.sells.y),
     pointStyle:"triangle", rotation:180, radius:9,
     backgroundColor:"#f85149", borderColor:"#f85149"},
  ]},
  options:{responsive:true, interaction:{mode:"index",intersect:false},
    scales:{x:{grid:{color:gridColor},ticks:{maxTicksLimit:12}},
            y:{grid:{color:gridColor}}}}
});

new Chart(document.getElementById("equityChart"), {
  type:"line",
  data:{ labels:D.times, datasets:[
    {label:"策略资金曲线", data:D.equity, borderColor:"#3fb950",
     borderWidth:1.6, pointRadius:0, tension:0.1, fill:false},
    {label:"买入持有基准", data:D.bh, borderColor:"#8b949e",
     borderWidth:1.2, borderDash:[5,4], pointRadius:0, tension:0.1},
  ]},
  options:{responsive:true, interaction:{mode:"index",intersect:false},
    scales:{x:{grid:{color:gridColor},ticks:{maxTicksLimit:12}},
            y:{grid:{color:gridColor}}}}
});
</script>
</body>
</html>"""
