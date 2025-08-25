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
} from "lucide-react";
import type { AnalysisResult } from "./api/analyze/route";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError("请输入要检查的邮箱地址或电话号码");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "分析失败");
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析过程中出现错误");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header - 居中显示，类似Google */}
        <div className="flex flex-col items-center justify-center min-h-screen">
          {!result && (
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
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        <Brain className="h-4 w-4 mr-2 animate-pulse" />
                        AI 分析中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        开始 AI 检测
                      </>
                    )}
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

          {/* Enhanced Results Page */}
          {result && (
            <div className="w-full max-w-5xl">
              {/* Sleek Header */}
              <div className="flex items-center mb-8 pb-6 border-b border-gray-200/50">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h1 className="ml-3 text-2xl font-light bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
                    AI 诈骗检测
                  </h1>
                </div>
                <div className="ml-auto">
                  <Button
                    onClick={() => {
                      setResult(null);
                      setQuery("");
                      setError("");
                    }}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    新搜索
                  </Button>
                </div>
              </div>

              {/* Enhanced Query Display */}
              <div className="mb-8 p-6 bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Brain className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500 font-medium">
                        AI 分析结果：
                      </span>
                      <span className="ml-3 font-mono text-lg text-gray-800">
                        {result.query}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700"
                  >
                    {result.type === "email" ? "邮箱地址" : "电话号码"}
                  </Badge>
                </div>
              </div>

              {/* Enhanced Results List */}
              <div className="space-y-6">
                {result.findings.length === 0 ? (
                  <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl"></div>
                      <CheckCircle className="relative h-16 w-16 mx-auto mb-4 text-green-500" />
                    </div>
                    <p className="text-gray-600 text-lg font-light">
                      AI 未发现风险信息
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      该联系方式暂未出现在风险数据库中
                    </p>
                  </div>
                ) : (
                  result.findings.map((finding, index) => (
                    <div
                      key={index}
                      className="group bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Enhanced Icon */}
                        <div className="mt-1 relative">
                          <div className="absolute inset-0 bg-current rounded-full blur opacity-20"></div>
                          <div className="relative">
                            {getResultIcon(finding.severity)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge
                              variant={getResultBadgeVariant(finding.severity)}
                              className="font-medium"
                            >
                              {getResultLabel(finding.severity)}
                            </Badge>
                            <span className="text-sm text-gray-600 font-medium">
                              {finding.source}
                            </span>
                            {finding.date && (
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                {finding.date}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 leading-relaxed font-light">
                            {finding.content}
                          </p>
                        </div>

                        {/* Enhanced External Link */}
                        {finding.url && (
                          <div>
                            <a
                              href={finding.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-10 h-10 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 group-hover:shadow-md"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Enhanced Footer */}
              <div className="mt-16 text-center text-gray-500 text-sm border-t border-gray-200/50 pt-8">
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
