"use client";

import { useState } from "react";
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

  const getStepIcon = (status: AnalysisStep["status"]) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* 初始搜索页面 */}
          {!loading && analysisSteps.length === 0 && !summary && (
            <div className="w-full max-w-2xl">
              {/* Logo with AI elements */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6 relative">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-2xl">
                      <Shield className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-full shadow-lg animate-bounce">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                <h1 className="text-6xl font-extralight bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
                  AI 诈骗检测
                </h1>
                <p className="text-lg text-gray-600 font-light">
                  智能分析邮箱地址和电话号码的安全性
                </p>
                <div className="flex items-center justify-center mt-3 text-sm text-gray-500">
                  <Brain className="h-4 w-4 mr-2 text-blue-500" />
                  由人工智能驱动
                </div>
              </div>

              {/* Enhanced Search Bar */}
              <div className="relative mb-8">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative flex items-center bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl px-6 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 focus-within:shadow-3xl focus-within:bg-white/90">
                    <Search className="h-5 w-5 text-gray-400 mr-4 transition-colors group-focus-within:text-blue-500" />
                    <Input
                      type="text"
                      placeholder="输入邮箱地址或电话号码进行AI分析"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && !loading && handleAnalyze()
                      }
                      className="flex-1 border-0 focus:outline-none focus:ring-0 text-lg bg-transparent placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Search Button */}
              <div className="text-center space-x-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="group relative px-8 py-4 text-sm rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
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
                <div className="text-center mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl text-red-600 text-sm shadow-lg">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* 分析进行中或已完成 */}
          {(loading || analysisSteps.length > 0) && (
            <div className="w-full max-w-4xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200/50">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                      <Brain
                        className={`h-8 w-8 text-white ${
                          loading ? "animate-pulse" : ""
                        }`}
                      />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-3xl font-light bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
                      {loading ? "AI 正在分析中..." : "AI 分析完成"}
                    </h1>
                    <p className="text-gray-600 font-mono text-lg mt-1">
                      {query}
                    </p>
                  </div>
                </div>
                {!loading && (
                  <Button
                    onClick={handleNewSearch}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    新搜索
                  </Button>
                )}
              </div>

              {/* Analysis Steps */}
              <div className="space-y-4 mb-8">
                {analysisSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4 shadow-lg transition-all duration-300 ${
                      step.status === "running"
                        ? "ring-2 ring-blue-500/50 bg-blue-50/60"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStepIcon(step.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-800">
                            {step.name}
                          </h3>
                          <Badge
                            variant={
                              step.status === "completed"
                                ? "outline"
                                : step.status === "running"
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
                            {step.status === "completed" && "已完成"}
                            {step.status === "error" && "错误"}
                          </Badge>
                        </div>
                        {step.message && (
                          <p className="text-sm text-gray-600 mt-1">
                            {step.message}
                          </p>
                        )}
                        {step.result && (
                          <div className="mt-3 p-3 bg-gray-50/80 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              {getResultIcon(step.result.severity)}
                              <Badge
                                variant={getResultBadgeVariant(
                                  step.result.severity
                                )}
                                className="text-xs"
                              >
                                {getResultLabel(step.result.severity)}
                              </Badge>
                              <span className="text-sm text-gray-600 font-medium">
                                {step.result.source}
                              </span>
                              {step.result.date && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                  {step.result.date}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">
                              {step.result.content}
                            </p>
                            {step.result.url && (
                              <div className="mt-2">
                                <a
                                  href={step.result.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  查看详情
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

              {/* 分析总结 */}
              {summary && (
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 shadow-lg mb-8">
                  <div className="flex items-center mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur"></div>
                      <Brain className="relative h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-gray-800">
                      AI 分析总结
                    </h3>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    {summary.recommendation}
                  </p>
                  <div className="flex items-center justify-between">
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
                        className="font-semibold"
                      >
                        {Math.round(summary.riskScore)}/100
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* 添加内容选项 */}
              {showAddContent && (
                <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      想要更深入的分析吗？
                    </h3>
                    <p className="text-gray-600 text-sm">
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
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/80"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={handleAddContent}
                        disabled={!additionalContent.trim()}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-xl"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        开始AI内容分析
                      </Button>
                      <Button
                        onClick={() => setShowAddContent(false)}
                        variant="outline"
                        className="rounded-xl"
                      >
                        暂不需要
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 text-center text-gray-500 text-sm border-t border-gray-200/50 pt-6">
                <div className="bg-amber-50/60 backdrop-blur-sm border border-amber-200/50 rounded-xl p-4 inline-block">
                  <p className="flex items-center justify-center text-amber-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />此 AI
                    工具仅供参考，请结合其他信息做出判断
                  </p>
                  <p className="mt-2 text-amber-600">
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
