"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Shield,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Sparkles,
  Brain,
  Clock,
  Plus,
  MessageSquare,
  Zap,
  Target,
  Globe,
  Users,
  MessageCircle,
  Database,
} from "lucide-react";
import type { AnalysisStep, AnalysisSummary } from "./api/analyze/route";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [showAddContent, setShowAddContent] = useState(false);
  const [additionalContent, setAdditionalContent] = useState("");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // 添加完成动画效果
  useEffect(() => {
    analysisSteps.forEach((step) => {
      if (step.status === "completed" && !completedSteps.has(step.id)) {
        setCompletedSteps((prev) => new Set(Array.from(prev).concat(step.id)));
        // 触发完成动画
        setTimeout(() => {
          const element = document.getElementById(`step-${step.id}`);
          if (element) {
            element.classList.add("animate-completion");
            setTimeout(() => {
              element.classList.remove("animate-completion");
            }, 1000);
          }
        }, 100);
      }
    });
  }, [analysisSteps, completedSteps]);

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError("请输入要检查的邮箱地址或电话号码");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysisSteps([]);
    setSummary(null);
    setShowAddContent(false);
    setCompletedSteps(new Set());

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        throw new Error("分析失败");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应流");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              // 如果是总结
              if (data.type === "summary") {
                setSummary(data as AnalysisSummary);
                setLoading(false);
                setShowAddContent(true);
              } else {
                // 如果是分析步骤
                const step = data as AnalysisStep;
                setAnalysisSteps((prev) => {
                  const existing = prev.find((s) => s.id === step.id);
                  if (existing) {
                    return prev.map((s) => (s.id === step.id ? step : s));
                  } else {
                    return [...prev, step];
                  }
                });
              }
            } catch (e) {
              console.error("解析数据错误:", e);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析过程中出现错误");
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setQuery("");
    setError("");
    setAnalysisSteps([]);
    setSummary(null);
    setShowAddContent(false);
    setAdditionalContent("");
    setCompletedSteps(new Set());
  };

  const handleAddContent = () => {
    // TODO: 实现添加内容的AI分析功能
    console.log("添加内容分析:", additionalContent);
  };

  const getResultIcon = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getResultBadgeVariant = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
    }
  };

  const getResultLabel = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "高风险";
      case "medium":
        return "可疑";
      case "low":
        return "安全";
    }
  };

  const getStepIcon = (status: AnalysisStep["status"], stepId: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />;
      case "running":
        return <LoadingSpinner size="sm" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  // 获取步骤特定图标
  const getStepSpecificIcon = (
    stepId: string,
    status: AnalysisStep["status"]
  ) => {
    if (status === "running") {
      return <LoadingSpinner size="sm" />;
    }

    const iconClass = "h-4 w-4";
    const completedClass =
      status === "completed" ? "text-blue-600" : "text-gray-400";

    switch (stepId) {
      case "google":
        return <Globe className={`${iconClass} ${completedClass}`} />;
      case "social":
        return <Users className={`${iconClass} ${completedClass}`} />;
      case "forums":
        return <MessageCircle className={`${iconClass} ${completedClass}`} />;
      case "blacklist":
        return <Database className={`${iconClass} ${completedClass}`} />;
      case "analysis":
        return <Brain className={`${iconClass} ${completedClass}`} />;
      default:
        return <Target className={`${iconClass} ${completedClass}`} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 添加CSS动画样式 */}
      <style jsx>{`
        @keyframes completion {
          0% {
            transform: scale(1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.2),
              0 10px 10px -5px rgba(59, 130, 246, 0.04);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
        }

        @keyframes success-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }

        @keyframes slide-in-result {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-completion {
          animation: completion 0.6s ease-in-out, success-glow 0.8s ease-out;
        }

        .result-slide-in {
          animation: slide-in-result 0.4s ease-out;
        }

        .step-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .step-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      {/* Animated background elements - 优化移动端显示 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 sm:top-20 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-5 sm:bottom-20 sm:right-20 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-64 sm:h-64 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen py-8">
          {/* 初始搜索页面 */}
          {!loading && analysisSteps.length === 0 && !summary && (
            <div className="w-full max-w-2xl">
              {/* Logo with AI elements - 优化移动端 */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex items-center justify-center mb-4 sm:mb-6 relative">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-3 sm:p-4 rounded-2xl shadow-2xl">
                      <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1 sm:p-1.5 rounded-full shadow-lg animate-bounce">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-extralight bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2 sm:mb-3">
                  AI 诈骗检测
                </h1>
                <p className="text-base sm:text-lg text-gray-600 font-light px-4">
                  智能分析邮箱地址和电话号码的安全性
                </p>
                <div className="flex items-center justify-center mt-2 sm:mt-3 text-sm text-gray-500">
                  <Brain className="h-4 w-4 mr-2 text-blue-500" />
                  由人工智能驱动
                </div>
              </div>

              {/* Enhanced Search Bar - 优化移动端 */}
              <div className="relative mb-6 sm:mb-8">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative flex items-center bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 focus-within:shadow-3xl focus-within:bg-white/90">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-3 sm:mr-4 transition-colors group-focus-within:text-blue-500 flex-shrink-0" />
                    <Input
                      type="text"
                      placeholder="输入邮箱地址或电话号码"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && !loading && handleAnalyze()
                      }
                      className="flex-1 border-0 focus:outline-none focus:ring-0 text-base sm:text-lg bg-transparent placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Search Button - 优化移动端 */}
              <div className="text-center space-x-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 text-sm rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    开始 AI 检测
                  </div>
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-center mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl text-red-600 text-sm shadow-lg mx-2">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* 分析进行中或已完成 - 优化移动端 */}
          {(loading || analysisSteps.length > 0) && (
            <div className="w-full max-w-4xl">
              {/* Header - 优化移动端 */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200/50 space-y-4 sm:space-y-0">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 sm:p-3 rounded-xl shadow-lg">
                      <Brain
                        className={`h-6 w-6 sm:h-8 sm:w-8 text-white ${
                          loading ? "animate-pulse" : ""
                        }`}
                      />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-light bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
                      {loading ? "AI 正在分析中..." : "AI 分析完成"}
                    </h1>
                    <p className="text-gray-600 font-mono text-sm sm:text-base md:text-lg mt-1 break-all">
                      {query}
                    </p>
                  </div>
                </div>
                {!loading && (
                  <Button
                    onClick={handleNewSearch}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 w-full sm:w-auto"
                  >
                    新搜索
                  </Button>
                )}
              </div>

              {/* Analysis Steps - 优化移动端间距和动画 */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {analysisSteps.map((step, index) => (
                  <div
                    key={step.id}
                    id={`step-${step.id}`}
                    className={`step-card bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4 sm:p-5 shadow-lg transition-all duration-500 transform ${
                      step.status === "running"
                        ? "ring-2 ring-blue-500/50 bg-blue-50/60 scale-[1.02]"
                        : step.status === "completed"
                        ? "bg-green-50/40 border-green-200/50"
                        : ""
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* 步骤编号和图标 */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div
                          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            step.status === "completed"
                              ? "bg-green-100 ring-2 ring-green-500/50"
                              : step.status === "running"
                              ? "bg-blue-100 ring-2 ring-blue-500/50"
                              : step.status === "error"
                              ? "bg-red-100 ring-2 ring-red-500/50"
                              : "bg-gray-100"
                          }`}
                        >
                          {step.result ? (
                            <div className="relative">
                              {getResultIcon(step.result.severity)}
                            </div>
                          ) : (
                            getStepSpecificIcon(step.id, step.status)
                          )}
                        </div>
                      </div>

                      {/* 步骤内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-base sm:text-lg flex items-center">
                              {step.name}
                              {step.status === "completed" && (
                                <Zap className="h-4 w-4 ml-2 text-green-500 animate-pulse" />
                              )}
                            </h3>
                            {step.message && step.status === "running" && (
                              <p className="text-sm text-blue-600 mt-1 animate-pulse">
                                {step.message}
                              </p>
                            )}
                          </div>

                          {/* 状态标签 */}
                          <div className="flex items-center space-x-2">
                            {step.result ? (
                              <Badge
                                variant={getResultBadgeVariant(
                                  step.result.severity
                                )}
                                className={`text-xs font-medium result-slide-in ${
                                  step.result.severity === "high"
                                    ? "bg-red-100 text-red-700 border-red-300"
                                    : step.result.severity === "medium"
                                    ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                    : "bg-green-100 text-green-700 border-green-300"
                                }`}
                              >
                                {getResultLabel(step.result.severity)}
                              </Badge>
                            ) : step.status !== "completed" ? (
                              <Badge
                                variant={
                                  step.status === "running"
                                    ? "default"
                                    : step.status === "error"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className={`text-xs ${
                                  step.status === "running"
                                    ? "bg-blue-500 text-white animate-pulse"
                                    : ""
                                }`}
                              >
                                {step.status === "pending" && "等待中"}
                                {step.status === "running" && "分析中"}
                                {step.status === "error" && "错误"}
                              </Badge>
                            ) : null}
                          </div>
                        </div>

                        {/* 结果内容 */}
                        {step.result && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-lg border border-gray-200/50 result-slide-in">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {step.result.content}
                                </p>
                              </div>
                              {step.result.date && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full ml-3 flex-shrink-0">
                                  {step.result.date}
                                </span>
                              )}
                            </div>
                            {step.result.url && (
                              <div className="mt-3 pt-3 border-t border-gray-200/50">
                                <a
                                  href={step.result.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  查看详细信息
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分析总结 - 优化移动端 */}
              {summary && (
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8 result-slide-in">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur animate-pulse"></div>
                      <Brain className="relative h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <h3 className="ml-3 text-base sm:text-lg font-semibold text-gray-800">
                      AI 分析总结
                    </h3>
                  </div>
                  <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-3 sm:mb-4">
                    {summary.recommendation}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">风险评分：</span>
                      <Badge
                        variant={
                          summary.riskScore >= 70
                            ? "destructive"
                            : summary.riskScore >= 40
                            ? "secondary"
                            : "outline"
                        }
                        className="font-semibold text-base px-3 py-1"
                      >
                        {Math.round(summary.riskScore)}/100
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* 添加内容选项 - 优化移动端 */}
              {showAddContent && (
                <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-4 sm:p-6 shadow-lg result-slide-in">
                  <div className="text-center mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                      想要更深入的分析吗？
                    </h3>
                    <p className="text-gray-600 text-sm px-2">
                      您可以添加更多信息（如聊天记录、邮件内容等），让AI分析其诈骗可能性
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <MessageSquare className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                      <textarea
                        placeholder="请输入要分析的聊天记录、邮件内容或其他相关信息..."
                        value={additionalContent}
                        onChange={(e) => setAdditionalContent(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl resize-none h-20 sm:h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/80 text-sm"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <Button
                        onClick={handleAddContent}
                        disabled={!additionalContent.trim()}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-xl text-sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        开始AI内容分析
                      </Button>
                      <Button
                        onClick={() => setShowAddContent(false)}
                        variant="outline"
                        className="rounded-xl sm:w-auto text-sm"
                      >
                        暂不需要
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer - 优化移动端 */}
              <div className="mt-6 sm:mt-8 text-center text-gray-500 text-sm border-t border-gray-200/50 pt-4 sm:pt-6">
                <div className="bg-amber-50/60 backdrop-blur-sm border border-amber-200/50 rounded-xl p-3 sm:p-4 inline-block mx-2">
                  <p className="flex items-center justify-center text-amber-700 text-xs sm:text-sm">
                    <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />此
                    AI 工具仅供参考，请结合其他信息做出判断
                  </p>
                  <p className="mt-2 text-amber-600 text-xs sm:text-sm">
                    遇到诈骗请及时向相关部门举报
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
