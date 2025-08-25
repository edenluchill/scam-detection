import { NextRequest, NextResponse } from "next/server";

export interface AnalysisResult {
  query: string;
  type: "email" | "phone";
  findings: Finding[];
  riskScore: number;
  recommendation: string;
  summary: string;
}

export interface Finding {
  source: string;
  content: string;
  severity: "low" | "medium" | "high";
  date?: string;
  url?: string;
}

// 模拟分析函数 - 在实际项目中，这里会调用真实的搜索API
async function analyzeContact(
  query: string,
  type: "email" | "phone"
): Promise<AnalysisResult> {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 模拟不同的结果
  const mockFindings: Finding[] = [];
  let riskScore = 0;

  // 根据输入生成不同的模拟结果
  if (query.includes("scam") || query.includes("fraud")) {
    mockFindings.push({
      source: "Google 搜索结果",
      content: `发现多个用户举报 ${query} 涉嫌诈骗活动`,
      severity: "high",
      date: "2024-01-15",
      url: "https://example.com/report1",
    });
    mockFindings.push({
      source: "Facebook 社区警告",
      content: "有用户在Facebook群组中警告此联系方式为诈骗",
      severity: "high",
      date: "2024-01-10",
    });
    riskScore = 85;
  } else if (query.includes("suspicious")) {
    mockFindings.push({
      source: "Reddit 讨论",
      content: "在Reddit上发现有关此联系方式的可疑活动讨论",
      severity: "medium",
      date: "2024-01-20",
    });
    riskScore = 60;
  } else if (query.length > 0) {
    // 对于正常输入，显示一些中性或积极的结果
    mockFindings.push({
      source: "Google 搜索结果",
      content: "未发现明显的诈骗举报",
      severity: "low",
      date: "2024-01-25",
    });
    mockFindings.push({
      source: "社交媒体检查",
      content: "在主要社交媒体平台上未发现相关警告",
      severity: "low",
    });
    riskScore = Math.random() * 30; // 0-30的随机分数
  }

  let recommendation = "";
  let summary = "";

  if (riskScore >= 70) {
    recommendation = "⚠️ 高风险：强烈建议避免与此联系方式互动，很可能是诈骗";
    summary = "检测到多个高风险指标，建议立即停止任何形式的联系";
  } else if (riskScore >= 40) {
    recommendation = "⚡ 中等风险：建议谨慎处理，进行额外验证";
    summary = "发现一些可疑迹象，建议通过其他渠道验证身份";
  } else {
    recommendation = "✅ 低风险：未发现明显的诈骗迹象，但仍需保持警惕";
    summary = "目前未发现明显的诈骗指标，但请继续保持谨慎";
  }

  return {
    query,
    type,
    findings: mockFindings,
    riskScore,
    recommendation,
    summary,
  };
}

// 自动检测输入类型的函数
function detectInputType(query: string): "email" | "phone" {
  // 检测邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(query)) {
    return "email";
  }

  // 检测电话号码格式（支持多种格式）
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
  if (phoneRegex.test(query.replace(/\s/g, ""))) {
    return "phone";
  }

  // 默认返回邮箱类型
  return "email";
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "请输入要检查的邮箱或电话号码" },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    const detectedType = detectInputType(trimmedQuery);

    const result = await analyzeContact(trimmedQuery, detectedType);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "分析过程中出现错误" }, { status: 500 });
  }
}
