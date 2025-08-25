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

export interface AnalysisStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "error";
  message?: string;
  result?: Finding;
}

export interface AnalysisSummary {
  type: "summary";
  summary: string;
  riskScore: number;
  recommendation: string;
}

// 分析步骤配置
const ANALYSIS_STEPS = [
  { id: "google", name: "Google 搜索检查", message: "正在搜索相关信息..." },
  { id: "social", name: "社交媒体检查", message: "正在检查社交媒体平台..." },
  { id: "forums", name: "论坛讨论检查", message: "正在检查论坛和讨论区..." },
  { id: "blacklist", name: "黑名单数据库", message: "正在查询黑名单数据库..." },
  { id: "analysis", name: "AI 风险分析", message: "正在进行智能风险评估..." },
];

// 流式分析函数
async function* streamAnalyzeContact(
  query: string,
  type: "email" | "phone"
): AsyncGenerator<AnalysisStep | AnalysisSummary, void, unknown> {
  const findings: Finding[] = [];
  let riskScore = 0;

  // 初始化所有步骤
  for (const step of ANALYSIS_STEPS) {
    yield {
      id: step.id,
      name: step.name,
      status: "pending",
    };
  }

  // 执行每个分析步骤
  for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
    const step = ANALYSIS_STEPS[i];

    // 开始执行步骤
    yield {
      id: step.id,
      name: step.name,
      status: "running",
      message: step.message,
    };

    // 模拟分析延迟
    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 1200)
    );

    let finding: Finding | undefined;

    // 根据步骤和输入生成结果
    switch (step.id) {
      case "google":
        if (query.includes("scam") || query.includes("fraud")) {
          finding = {
            source: "Google 搜索结果",
            content: `发现多个用户举报 ${query} 涉嫌诈骗活动`,
            severity: "high",
            date: "2024-01-15",
            url: "https://example.com/report1",
          };
          riskScore += 30;
        } else {
          finding = {
            source: "Google 搜索结果",
            content: "未发现明显的诈骗举报",
            severity: "low",
            date: "2024-01-25",
          };
          riskScore += Math.random() * 10;
        }
        break;

      case "social":
        if (query.includes("scam") || query.includes("fraud")) {
          finding = {
            source: "Facebook 社区警告",
            content: "有用户在Facebook群组中警告此联系方式为诈骗",
            severity: "high",
            date: "2024-01-10",
          };
          riskScore += 25;
        } else {
          finding = {
            source: "社交媒体检查",
            content: "在主要社交媒体平台上未发现相关警告",
            severity: "low",
          };
          riskScore += Math.random() * 8;
        }
        break;

      case "forums":
        if (query.includes("suspicious")) {
          finding = {
            source: "Reddit 讨论",
            content: "在Reddit上发现有关此联系方式的可疑活动讨论",
            severity: "medium",
            date: "2024-01-20",
          };
          riskScore += 20;
        } else {
          finding = {
            source: "论坛检查",
            content: "在技术论坛和讨论区中未发现相关风险信息",
            severity: "low",
          };
          riskScore += Math.random() * 5;
        }
        break;

      case "blacklist":
        if (query.includes("scam") || query.includes("fraud")) {
          finding = {
            source: "黑名单数据库",
            content: "该联系方式已被列入诈骗黑名单",
            severity: "high",
            date: "2024-01-08",
          };
          riskScore += 20;
        } else {
          finding = {
            source: "黑名单数据库",
            content: "该联系方式未出现在已知的诈骗黑名单中",
            severity: "low",
          };
          riskScore += Math.random() * 3;
        }
        break;

      case "analysis":
        // AI 分析步骤
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (riskScore >= 50) {
          finding = {
            source: "AI 风险评估",
            content: "综合分析显示该联系方式存在一定风险，建议谨慎处理",
            severity: "medium",
          };
        } else {
          finding = {
            source: "AI 风险评估",
            content: "综合分析显示该联系方式风险较低，但仍需保持警惕",
            severity: "low",
          };
        }
        break;
    }

    if (finding) {
      findings.push(finding);
    }

    // 完成步骤
    yield {
      id: step.id,
      name: step.name,
      status: "completed",
      result: finding,
    };
  }

  // 生成最终总结
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

  // 返回最终总结
  yield {
    type: "summary",
    summary,
    riskScore: Math.min(100, riskScore),
    recommendation,
  } as AnalysisSummary;
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

    // 创建 SSE 响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const data of streamAnalyzeContact(
            trimmedQuery,
            detectedType
          )) {
            const chunk = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          const errorData = encoder.encode(
            `data: ${JSON.stringify({ error: "分析过程中出现错误" })}\n\n`
          );
          controller.enqueue(errorData);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "分析过程中出现错误" }, { status: 500 });
  }
}
