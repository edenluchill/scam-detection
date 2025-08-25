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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4">
        {/* Header - 居中显示，类似Google */}
        <div className="flex flex-col items-center justify-center min-h-screen">
          {!result && (
            <div className="w-full max-w-2xl">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Shield className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-5xl font-light text-gray-700 mb-2">
                  诈骗检测
                </h1>
                <p className="text-lg text-gray-500">
                  检查邮箱地址和电话号码的安全性
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative mb-8">
                <div className="flex items-center border border-gray-300 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-shadow focus-within:shadow-xl">
                  <Search className="h-5 w-5 text-gray-400 mr-3" />
                  <Input
                    type="text"
                    placeholder="输入邮箱地址或电话号码"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !loading && handleAnalyze()
                    }
                    className="flex-1 border-0 focus:outline-none focus:ring-0 text-lg"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="text-center space-x-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-8 py-3 text-sm rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      检查中...
                    </>
                  ) : (
                    "开始检查"
                  )}
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-center mt-4 text-red-600 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Results Page */}
          {result && (
            <div className="w-full max-w-4xl">
              {/* Simple Header */}
              <div className="flex items-center mb-8 pb-4 border-b">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-light text-gray-700">诈骗检测</h1>
                <div className="ml-auto">
                  <Button
                    onClick={() => {
                      setResult(null);
                      setQuery("");
                      setError("");
                    }}
                    variant="outline"
                    size="sm"
                  >
                    新搜索
                  </Button>
                </div>
              </div>

              {/* Search Query Display */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">检查结果：</span>
                    <span className="ml-2 font-mono text-lg">
                      {result.query}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {result.type === "email" ? "邮箱地址" : "电话号码"}
                  </Badge>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-4">
                {result.findings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>未发现相关信息</p>
                  </div>
                ) : (
                  result.findings.map((finding, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {/* Icon */}
                      <div className="mt-1">
                        {getResultIcon(finding.severity)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge
                            variant={getResultBadgeVariant(finding.severity)}
                          >
                            {getResultLabel(finding.severity)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {finding.source}
                          </span>
                          {finding.date && (
                            <span className="text-xs text-gray-400">
                              {finding.date}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {finding.content}
                        </p>
                      </div>

                      {/* External Link */}
                      {finding.url && (
                        <div>
                          <a
                            href={finding.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer Warning */}
              <div className="mt-12 text-center text-gray-500 text-sm border-t pt-8">
                <p>⚠️ 此工具仅供参考，请结合其他信息做出判断</p>
                <p className="mt-2">遇到诈骗请及时向相关部门举报</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
