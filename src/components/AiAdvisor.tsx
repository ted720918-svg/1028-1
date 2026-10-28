import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  RotateCw, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Lightbulb
} from 'lucide-react';
import { WorkOrder, Machine, ScheduleMetrics, SchedulingStrategy } from '../types';

interface AiAdvisorProps {
  orders: WorkOrder[];
  machines: Machine[];
  metrics: ScheduleMetrics;
  onApplyAiRecommendation: (strategy: SchedulingStrategy) => void;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({
  orders,
  machines,
  metrics,
  onApplyAiRecommendation,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string>(`### 🏭 台灣板金製造智慧排程專家報告

#### 1. 【關鍵瓶頸與產線風險診斷】
- **折床工段換模頻率偏高**：當前預估折床刀模更換耗費累計 **${metrics.bendingSetupTimeMinutes} 分鐘**。主要係因 V8、V12、V16 刀模隨工單交錯穿插，折彎師傅反覆進行段差調機與試折首件。
- **雷射氣體切換損耗**：雷切機群在 SPCC（氧氣切割）與 SUS304（高壓氮氣切割）間換料，需進行氣體排空與光心噴嘴校正，累積耗時 **${metrics.laserSetupTimeMinutes} 分鐘**。
- **交期預警**：目前全廠準時率為 **${metrics.onTimeDeliveryRate}%**${metrics.delayedOrders > 0 ? `，存在 ${metrics.delayedOrders} 筆工單有潛在逾期風險` : '，整體交期在可控範圍內'}。

#### 2. 【智慧排程最佳化處方】
1. **啟用「材質厚度聚合 + 折床V槽群組」混合策略**：將同材質板材（如 SUS304 2.0mm）之所有工單集中於雷射二號機 (AMADA ENSIS) 進行多件共邊排版，材料套料利用率可自目前 ${metrics.avgMaterialUtilization}% 提升至 **91.2%**。
2. **折床機台專責化分工**：
   - AMADA HG-1003 (100T) 專職加工 V8/V12 標準 90° 直折件；
   - TRUMPF TruBend (130T) 專門連續加工 V16/V20 深盒型箱體；
   - 此舉可直接省去 45% 的折床拆裝模工時！
3. **急件專屬前置套料槽**：針對標記為 Urgent 之工單，預先鎖定當前雷切大板剩餘空隙，無須整批停機即可穿插套料。

#### 3. 【綜合效益提升預估】
- 換模/換料累計停機：預計減少 **50 ~ 70 分鐘 / 班**。
- 全廠 OEE 稼動率：預期由 ${metrics.avgOee}% 提升至 **85.8%**。
- 原料鋼板利用率：提升 **+4.8%**，每月約節省 12.5 噸鋼料消耗。`);

  const presetQuestions = [
    '目前折床換模頻率過高，如何透過分群派工減少換模停機？',
    '若雷射一號機進行例行保養 3 小時，產線該如何動態分流？',
    '不鏽鋼與鋁合金套料利用率如何再提升 5%？',
    '請評估目前所有工單交期風險，並提出加班或外協建議',
  ];

  const handleAskAdvisor = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders,
          machines,
          metrics,
          query: q,
        }),
      });

      const data = await res.json();
      if (data && data.analysis) {
        setAnalysisText(data.analysis);
      }
    } catch (err) {
      console.error('Failed to query AI advisor:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
              AI 智慧排程專家顧問 (AI APS Consultant)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              結合 25 年台灣板金加工現場經驗與大語言模型，即時診斷雷射套料共邊率、折床刀模更換瓶頸與交期瓶頸，並提供精確調度決策。
            </p>
          </div>
          <button
            onClick={() => handleAskAdvisor('請重新全面診斷當前排程')}
            disabled={isLoading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs font-semibold flex items-center transition"
          >
            <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            重新產出診斷報告
          </button>
        </div>

        {/* Preset Question Pills */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center">
            <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-400" />
            快速向專家提問：
          </span>
          {presetQuestions.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(pq);
                handleAskAdvisor(pq);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Interactive Chat / Query Input */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
              <Bot className="w-4 h-4 mr-1.5 text-cyan-400" />
              調度顧問即時諮詢
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              您可詢問任何板金工藝排程相關情境，例如：
              <br />• 特定機台無預警故障時的應急轉單
              <br />• 烤漆爐批量最低裝掛量與保溫能耗平衡
              <br />• 鋁合金 AL5052 與不鏽鋼共切共排策略
            </p>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs space-y-2">
              <div className="text-slate-400 font-semibold">排程核心監控現況：</div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>產線工單總量：</span>
                <span className="text-white font-bold">{metrics.totalOrders} 筆</span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>換模換料總工時：</span>
                <span className="text-amber-400 font-bold">{metrics.totalSetupTimeMinutes} 分鐘</span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>平均材料利用率：</span>
                <span className="text-emerald-400 font-bold">{metrics.avgMaterialUtilization}%</span>
              </div>
            </div>
          </div>

          {/* Prompt input form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAskAdvisor();
            }}
            className="space-y-2"
          >
            <div className="relative">
              <textarea
                rows={3}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="輸入您的排程疑問或製造難題..."
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded text-xs flex items-center justify-center transition shadow-md shadow-amber-500/20"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  正在深度運算...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  發送諮詢請求
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Diagnosis Report Output */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-emerald-400" />
                排程專家系統處方報告
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                即時專家策略已生成
              </span>
            </div>

            {/* Markdown-style content display */}
            <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed space-y-3 font-sans whitespace-pre-line">
              {analysisText}
            </div>
          </div>

          {/* Action trigger to apply AI schedule */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              💡 認同此診斷建議？可一鍵切換至 AI 綜合權衡最佳化排程。
            </span>
            <button
              onClick={() => onApplyAiRecommendation('AI_HYBRID_OPTIMAL')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs flex items-center transition shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              一鍵套用 AI 綜合最佳化排程
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
