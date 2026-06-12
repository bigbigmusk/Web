"""商业机会识别层。

两段式：
  1. 规则初筛（rule_score）：用一组可配置的「痛点 / 付费意愿 / 求工具」信号词
     给每个帖子打分，快速从海量帖子里筛掉噪音，零成本、可离线。
  2. AI 精判（Claude）：只对规则初筛得分达标的高分候选，调用 Claude 做结构化判断，
     输出是否真的是商业机会、机会类型、目标用户、痛点、建议方案、变现方式、置信度等。
     未配置 ANTHROPIC_API_KEY 时自动跳过这一步，仅用规则结果。
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

import config

# ----------------------------------------------------------------------------
# 规则信号词库：每个信号是 (正则, 权重)。命中即累加权重。
# 这些短语是创业者公认的「机会信号」——表达痛点、付费意愿、在找工具/替代品。
# ----------------------------------------------------------------------------
SIGNALS: list[tuple[str, int]] = [
    # —— 强付费意愿 ——
    (r"\b(i('?| wi)ll|i'?d|happy to|willing to) pay\b", 5),
    (r"\b(take|shut up and take) my money\b", 5),
    (r"\bshut up and take\b", 4),
    (r"\bworth paying for\b", 4),
    (r"\bi would buy\b", 4),
    (r"\bany paid (tool|service|app|alternative)\b", 4),
    # —— 明确痛点 / 不满 ——
    (r"\bi (wish|wished) (there was|there were|i had|someone)\b", 5),
    (r"\bis there (a|an|any) (tool|app|service|way|software|website|product)\b", 4),
    (r"\blooking for (a|an|some) (tool|app|service|alternative|solution)\b", 4),
    (r"\b(hate|frustrat\w+|annoying|painful|tedious|nightmare) \w+", 3),
    (r"\b(so much|too much) (time|manual|work)\b", 3),
    (r"\bwaste(s|d)? (so much |a lot of )?time\b", 3),
    (r"\bthere'?s?\s*(is|has|must|gotta|got\s+to|to|be)\b.{0,12}better way\b", 5),
    (r"\b(a|some) better way (to|of|for)\b", 3),
    (r"\bwhy is there no\b", 4),
    (r"\bwhy isn'?t there (a|an)\b", 4),
    (r"\bdoes (anyone|anybody) know (a|of a|an)\b", 3),
    # —— 现有方案不满 / 求替代 ——
    (r"\b(alternative|replacement) (to|for)\b", 3),
    (r"\b(too expensive|overpriced|can'?t afford)\b", 3),
    (r"\b(switching|moving) (away )?from\b", 2),
    (r"\bsick of\b", 3),
    # —— 手动 / 重复劳动（自动化机会）——
    (r"\b(manual(ly)?|by hand|copy.?paste|spreadsheet)\b", 2),
    (r"\b(automate|automating|automation)\b", 2),
    (r"\bevery (day|week|time) i have to\b", 3),
    # —— 直接的需求表达 ——
    (r"\bi need (a|an|some|to find)\b", 2),
    (r"\bhow do (you|people) (manage|handle|deal with|track)\b", 2),
    (r"\brecommend(ation)?s? for\b", 2),
]

_COMPILED = [(re.compile(p, re.IGNORECASE), w) for p, w in SIGNALS]


@dataclass
class Detection:
    """单个帖子的识别结果。"""

    # 规则部分
    rule_score: int = 0
    matched_signals: list[str] = field(default_factory=list)

    # AI 部分（未启用 AI 时保持默认值）
    ai_used: bool = False
    is_opportunity: bool = False
    ai_confidence: int = 0  # 0-100
    opportunity_type: str = ""
    target_audience: str = ""
    pain_point: str = ""
    suggested_solution: str = ""
    monetization: str = ""
    reasoning: str = ""


# ----------------------------------------------------------------------------
# 规则初筛
# ----------------------------------------------------------------------------
def score_rules(text: str) -> tuple[int, list[str]]:
    """对一段文本做规则打分，返回 (总分, 命中的信号片段列表)。"""
    score = 0
    matched: list[str] = []
    for pattern, weight in _COMPILED:
        m = pattern.search(text)
        if m:
            score += weight
            snippet = m.group(0).strip()
            if snippet and snippet.lower() not in (s.lower() for s in matched):
                matched.append(snippet)
    return score, matched


# ----------------------------------------------------------------------------
# AI 精判（Claude，结构化输出）
# ----------------------------------------------------------------------------
_anthropic_client = None

_AI_SYSTEM = """你是一位经验丰富的连续创业者和风险投资人，专门从社区讨论中发现可落地的商业机会。
给你一个 Reddit 帖子，你要判断它是否揭示了一个**真实、具体、可变现**的商业机会
（例如：用户表达了明确痛点、对现有方案不满、愿意付费、在寻找尚不存在的工具/服务）。

判断标准要严格：
- 仅仅是闲聊、抱怨情绪、新闻分享、求助但无商业价值的，不算机会。
- 真正的机会应该能指向一个可以做成产品/服务并赚钱的方向。

请用中文填写所有文本字段，simple、具体、可执行。confidence 是你对「这是一个值得追的商业机会」的置信度(0-100)。"""

# 结构化输出 schema —— 用 output_config.format 强制 Claude 返回合法 JSON
_AI_SCHEMA = {
    "type": "object",
    "properties": {
        "is_opportunity": {
            "type": "boolean",
            "description": "这个帖子是否揭示了一个真实可变现的商业机会",
        },
        "confidence": {
            "type": "integer",
            "description": "0-100，对这是一个值得追的商业机会的置信度",
        },
        "opportunity_type": {
            "type": "string",
            "description": "机会类型，如 SaaS工具 / 移动App / 服务 / 内容/社区 / 电商 / 插件 / 自动化 等；不是机会则填'无'",
        },
        "target_audience": {
            "type": "string",
            "description": "目标用户是谁",
        },
        "pain_point": {
            "type": "string",
            "description": "帖子里暴露的核心痛点（一句话）",
        },
        "suggested_solution": {
            "type": "string",
            "description": "建议的产品/服务方向（一句话）",
        },
        "monetization": {
            "type": "string",
            "description": "可能的变现方式，如 订阅 / 一次性付费 / 抽佣 / 广告 等",
        },
        "reasoning": {
            "type": "string",
            "description": "做出该判断的简要理由",
        },
    },
    "required": [
        "is_opportunity",
        "confidence",
        "opportunity_type",
        "target_audience",
        "pain_point",
        "suggested_solution",
        "monetization",
        "reasoning",
    ],
    "additionalProperties": False,
}


def _get_anthropic():
    global _anthropic_client
    if _anthropic_client is None:
        import anthropic

        _anthropic_client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    return _anthropic_client


def judge_with_ai(title: str, body: str, subreddit: str) -> dict:
    """调用 Claude 对单个帖子做结构化判断，返回 dict。失败时抛异常由上层兜底。"""
    import json

    client = _get_anthropic()
    # 控制输入长度，避免超长正文浪费 token
    body = (body or "")[:4000]
    user_content = (
        f"子版块: r/{subreddit}\n"
        f"标题: {title}\n\n"
        f"正文:\n{body if body else '(无正文)'}"
    )

    resp = client.messages.create(
        model=config.AI_MODEL,
        max_tokens=1500,
        system=_AI_SYSTEM,
        messages=[{"role": "user", "content": user_content}],
        output_config={"format": {"type": "json_schema", "schema": _AI_SCHEMA}},
    )

    # 处理安全拒绝（结构化输出在 refusal 时不保证符合 schema）
    if getattr(resp, "stop_reason", None) == "refusal":
        raise RuntimeError("Claude 拒绝了该请求")

    text = next((b.text for b in resp.content if b.type == "text"), "")
    return json.loads(text)


# ----------------------------------------------------------------------------
# 组合：先规则，再（可选）AI
# ----------------------------------------------------------------------------
def detect(
    title: str,
    body: str,
    subreddit: str,
    *,
    use_ai: bool,
    run_ai: bool,
) -> Detection:
    """对单个帖子做完整识别。

    Args:
        use_ai: 全局是否启用 AI（且已配置密钥）
        run_ai: 该帖子是否通过了规则初筛、需要送 AI 精判
    """
    full_text = f"{title}\n{body}"
    rule_score, matched = score_rules(full_text)
    det = Detection(rule_score=rule_score, matched_signals=matched)

    if use_ai and run_ai:
        try:
            r = judge_with_ai(title, body, subreddit)
            det.ai_used = True
            det.is_opportunity = bool(r.get("is_opportunity", False))
            det.ai_confidence = int(r.get("confidence", 0))
            det.opportunity_type = r.get("opportunity_type", "")
            det.target_audience = r.get("target_audience", "")
            det.pain_point = r.get("pain_point", "")
            det.suggested_solution = r.get("suggested_solution", "")
            det.monetization = r.get("monetization", "")
            det.reasoning = r.get("reasoning", "")
        except Exception as exc:
            det.reasoning = f"AI 判断失败，回退到规则结果：{exc}"
            det.is_opportunity = rule_score >= 5
    else:
        # 纯规则模式：分数达标即视为候选机会
        det.is_opportunity = rule_score >= 5

    return det
