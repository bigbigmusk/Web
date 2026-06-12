# Reddit 商业机会爬虫 🔍

一个**全自动**爬取 Reddit 论坛、识别商业机会、并导出 Excel 的工具。

> 思路：很多创业机会就藏在用户的真实抱怨里 —— "我希望有个工具能…"、"愿意付费求一个…"、"现有方案太贵了"。
> 这个工具自动阅读海量帖子，先用**关键词规则**快速筛掉噪音，再用 **Claude AI** 对高分候选做精准判断，
> 最终把识别出的机会整理成一张 Excel。

---

## ✨ 特性

- **两种抓取方式，自动切换**
  - 默认走 Reddit **公开 JSON 接口** —— 零配置，开箱即用。
  - 配置了 API 密钥则自动切换到官方 **PRAW** —— 更稳定、限额更高，适合大规模抓取。
- **两段式识别**
  - **规则初筛**：内置一套「痛点 / 付费意愿 / 求工具」信号词，给每个帖子打分，免费、可离线。
  - **AI 精判**：只对高分候选调用 Claude（`claude-opus-4-8`，结构化输出），判断是否真机会，并给出机会类型、目标用户、痛点、建议方案、变现方式、置信度、理由。未配置密钥时自动只用规则。
- **三种使用形态**
  - 🌐 网页仪表盘（实时进度 + 机会卡片 + 一键下载 Excel）
  - ⌨️ 命令行（适合配合 cron / GitHub Actions 做定时全自动抓取）
  - 📄 Excel 输出（格式化、可点击链接、机会高亮、按重要度排序）

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd reddit-opportunity-scraper
pip install -r requirements.txt
```

### 2. （可选）配置密钥

```bash
cp .env.example .env
# 编辑 .env，按需填入 ANTHROPIC_API_KEY / Reddit 密钥
```

> 全部不填也能跑：用公开 JSON 抓取 + 纯规则识别。
> 填了 `ANTHROPIC_API_KEY` 就能用 Claude AI 精判，识别准确率显著提升。

### 3. 启动网页界面

```bash
python app.py
# 打开 http://127.0.0.1:5000
```

在页面里填子版块（如 `SaaS Entrepreneur smallbusiness`）→ 点「开始抓取」→ 看实时进度 →
浏览识别出的机会卡片 → 点「下载 Excel」。

### 4. 或者用命令行

```bash
# 抓取 + AI 精判 + 导出 Excel
python cli.py --subreddits SaaS Entrepreneur smallbusiness --sort new --limit 80

# 纯规则、零成本、可离线
python cli.py -s startups -s sideproject --no-ai
```

---

## 🔑 获取密钥

| 密钥 | 用途 | 在哪获取 |
|------|------|----------|
| `ANTHROPIC_API_KEY` | Claude AI 精判 | https://console.anthropic.com |
| `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` | 切换到 PRAW | https://www.reddit.com/prefs/apps （创建 "script" 类型 App）|

---

## ⏰ 做成「全自动定时抓取」

把 CLI 配进系统定时任务即可无人值守运行。例如每天早上 8 点：

```cron
0 8 * * * cd /path/to/reddit-opportunity-scraper && python cli.py -s SaaS -s Entrepreneur --limit 100
```

或用 GitHub Actions（把密钥配成仓库 Secrets，定时跑 `cli.py` 并把产出的 Excel 作为 artifact 上传）。

---

## 🧩 项目结构

```
reddit-opportunity-scraper/
├── app.py             # Flask 网页服务（后台任务 + 实时进度 API）
├── cli.py             # 命令行入口（适合定时任务）
├── scraper.py         # 编排层：抓取 → 规则 → AI → 汇总
├── reddit_client.py   # 抓取层：公开 JSON / PRAW，自动切换
├── detector.py        # 识别层：规则信号词 + Claude 结构化精判
├── excel_exporter.py  # 导出层：openpyxl 生成格式化 Excel
├── config.py          # 读取环境变量
├── static/            # 网页前端（index.html / style.css / app.js）
├── requirements.txt
└── .env.example
```

---

## 🛠 调参建议

- **抓不到机会？** 调低「规则初筛阈值」（默认 3）、换更活跃的子版块、或把排序换成 `new`。
- **想省钱？** 关闭 AI 精判，或调低「AI 最大调用次数」上限。
- **要更准？** 开启 AI 精判；信号词库在 `detector.py` 的 `SIGNALS` 里，可按你的领域增删。

---

## ⚠️ 合规提示

请遵守 [Reddit API 使用条款](https://www.redditinc.com/policies/data-api-terms) 与各子版块规则，
合理设置抓取频率（本工具默认对公开接口做了限速），不要用于骚扰、批量私信或转售数据。
