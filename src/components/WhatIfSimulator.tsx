import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Layers, 
  Flame, 
  Plus, 
  RotateCw, 
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { WorkOrder, MaterialType, Machine, WhatIfSimulationResult } from '../types';

interface WhatIfSimulatorProps {
  currentOrders: WorkOrder[];
  machines: Machine[];
  onApplyRushOrder: (order: WorkOrder, selectedOptionId: string) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  currentOrders,
  machines,
  onApplyRushOrder,
}) => {
  const [customer, setCustomer] = useState('研華科技');
  const [partName, setPartName] = useState('5G 防水天線箱體急件');
  const [partNumber, setPartNumber] = useState('ADV-5G-RUSH-09');
  const [material, setMaterial] = useState<MaterialType>('SUS304');
  const [thickness, setThickness] = useState<number>(2.0);
  const [qty, setQty] = useState<number>(80);
  const [dueDate, setDueDate] = useState('2026-10-13 17:00');
  const [toolingReq, setToolingReq] = useState('下模 V16 / 上模 88°');
  const [notes, setNotes] = useState('客戶要求明日下班前首批出貨，優先度特急');

  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('opt-batch');

  // Realistic presets
  const presets = [
    {
      title: '研華 5G 機箱急件 (不鏽鋼 2.0mm)',
      customer: '研華科技',
      partName: '5G 防水天線箱體急件',
      partNumber: 'ADV-5G-RUSH-09',
      material: 'SUS304' as MaterialType,
      thickness: 2.0,
      qty: 80,
      dueDate: '2026-10-13 17:00',
      toolingReq: '下模 V16 / 上模 88°',
    },
    {
      title: '台達 醫療潔淨內罩 (SUS304 1.5mm)',
      customer: '台達電子',
      partName: '透析儀電控防護罩',
      partNumber: 'DEL-MED-COV-11',
      material: 'SUS304' as MaterialType,
      thickness: 1.5,
      qty: 120,
      dueDate: '2026-10-13 14:00',
      toolingReq: '下模 V10 / 聚氨酯防刮墊',
    },
    {
      title: '和碩 伺服器電源蓋 (SPCC 1.2mm)',
      customer: '和碩聯合',
      partName: '1U 伺服器電源支撐蓋',
      partNumber: 'PEG-SRV-PWR-05',
      material: 'SPCC' as MaterialType,
      thickness: 1.2,
      qty: 250,
      dueDate: '2026-10-13 20:00',
      toolingReq: '死邊折彎下模 / 30° 銳角刀',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setCustomer(p.customer);
    setPartName(p.partName);
    setPartNumber(p.partNumber);
    setMaterial(p.material);
    setThickness(p.thickness);
    setQty(p.qty);
    setDueDate(p.dueDate);
    setToolingReq(p.toolingReq);
    setSimulationResult(null);
  };

  const runSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      // Calculate what-if impact
      const isSus = material === 'SUS304';
      const isThick = thickness >= 2.0;

      // Find candidate machine
      const laserMachine = isSus ? 'M-LASER-2 (AMADA ENSIS-3015AJ 9kW)' : 'M-LASER-1 (TRUMPF 10kW)';
      const bendMachine = isThick ? 'M-BEND-2 (TRUMPF TruBend 130T)' : 'M-BEND-1 (AMADA HG-1003 100T)';

      // Potentially delayed orders
      const delayedOrders = currentOrders.filter(o => o.priority !== 'urgent' && o.status === 'waiting').slice(0, 2);

      const result: WhatIfSimulationResult = {
        newOrder: {
          id: `WO-RUSH-${Date.now().toString().slice(-4)}`,
          partNumber,
          partName,
          customer,
          material,
          thickness,
          blankSize: '850 x 620 mm',
          qty,
          priority: 'urgent',
          dueDate,
          releaseDate: '2026-10-13 08:00',
          status: 'in_progress',
          isRushOrder: true,
          nestingYield: 89.4,
          notes,
          routing: [
            { stage: 'LASER', stageName: '雷射切割', assignedMachineId: isSus ? 'M-LASER-2' : 'M-LASER-1', estimatedMinutes: Math.round(qty * 0.8), setupMinutes: 15, status: 'pending' },
            { stage: 'DEBURR', stageName: '去毛邊', assignedMachineId: 'M-DEBURR-1', estimatedMinutes: 30, setupMinutes: 5, status: 'pending' },
            { stage: 'BEND', stageName: 'CNC折彎', assignedMachineId: isThick ? 'M-BEND-2' : 'M-BEND-1', estimatedMinutes: Math.round(qty * 0.9), setupMinutes: 20, toolingRequirement: toolingReq, status: 'pending' },
            { stage: 'TAP_RIVET', stageName: '壓鉚攻牙', assignedMachineId: 'M-TAP-1', estimatedMinutes: 40, setupMinutes: 10, status: 'pending' },
            { stage: 'QC_PACK', stageName: '全檢包裝', assignedMachineId: 'M-QC-1', estimatedMinutes: 35, setupMinutes: 0, status: 'pending' },
          ],
        },
        impactScore: 'medium',
        delayedOrdersCount: delayedOrders.length,
        delayedOrderIds: delayedOrders.map(o => o.id),
        additionalSetupMinutes: 35,
        recommendedSlot: {
          laserMachineId: laserMachine,
          bendMachineId: bendMachine,
          startHour: 10.5,
          completionTime: '明日 15:45 (提前 1.25 小時達交)',
        },
        options: [
          {
            id: 'opt-batch',
            title: '方案 A：智能批次套料插入 (推薦)',
            description: `將急件併入雷射二機當前進行中的 ${material} ${thickness}mm 套料大板，折床配合使用同模具段差。`,
            pros: '極小化板材切換與氣體置換損失，共邊套料材料利用率維持 89% 以上。',
            cons: `需微調延後工單 ${delayedOrders[0]?.id || 'WO-0843'} 約 40 分鐘（仍在安全寬放期內）。`,
            addedSetupMinutes: 15,
            delayImpactCount: 1,
            otdImpact: '整廠準時率保持 98.8%',
          },
          {
            id: 'opt-overtime',
            title: '方案 B：常規排程 + 啟動晚班加班 2 小時',
            description: '維持日間原定排程順序不變，在 17:00-19:00 加班時段專車消化此急單。',
            pros: '對原訂所有 8 筆既有工單完全零干擾、零延誤風險。',
            cons: '需支付折床與雷射夜間技師加班費用 (約 2 小時)。',
            addedSetupMinutes: 25,
            delayImpactCount: 0,
            otdImpact: '整廠準時率 100%',
          },
          {
            id: 'opt-split',
            title: '方案 C：分批交貨排程 (先交 50% 急單)',
            description: `首批先切 40 件優先進行折彎送交客戶；剩餘 40 件併入後天常規批次。`,
            pros: '大幅降低當日產線緊繃度，折床無須更換專用長模。',
            cons: '需要與客戶業務窗口確認能否接受分批驗收。',
            addedSetupMinutes: 10,
            delayImpactCount: 0,
            otdImpact: '首批 100% 準時，整批無風險',
          },
        ],
      };

      setSimulationResult(result);
      setIsSimulating(false);
    }, 600);
  };

  const handleConfirmApply = () => {
    if (!simulationResult) return;
    onApplyRushOrder(simulationResult.newOrder, selectedOptionId);
  };

  return (
    <div className="space-y-4">
      {/* Introduction Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center">
              <Zap className="w-4 h-4 mr-2 text-amber-400" />
              急件插單智慧模擬器 (What-If Rush Order Impact Simulator)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              板金加工廠最棘手的問題是業務突發急單插單。若盲目插單，將導致雷射板材頻繁退換、折床刀模拆裝浪費數小時，並使其他工單失控延期。本系統透過實時試算，評估換模衝擊並產出最佳決策。
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-semibold shrink-0">
            演算法即時推演
          </span>
        </div>

        {/* Preset quick buttons */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center">
            <Flame className="w-3.5 h-3.5 mr-1 text-red-400" />
            快速載入現場常見插單範例：
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 hover:text-amber-300 text-slate-300 rounded border border-slate-700 transition font-medium"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Input Parameters Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            1. 輸入急件工單參數
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">客戶名稱</label>
              <input
                type="text"
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">工單編號 / 料號</label>
              <input
                type="text"
                value={partNumber}
                onChange={e => setPartNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-slate-400 block mb-1">工件品名</label>
            <input
              type="text"
              value={partName}
              onChange={e => setPartName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">材質</label>
              <select
                value={material}
                onChange={e => setMaterial(e.target.value as MaterialType)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="SPCC">SPCC (冷軋鋼)</option>
                <option value="SUS304">SUS304 (不鏽鋼)</option>
                <option value="AL5052">AL5052 (鋁合金)</option>
                <option value="SECC">SECC (鍍鋅板)</option>
                <option value="SPHC">SPHC (熱軋板)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">板厚 (mm)</label>
              <select
                value={thickness}
                onChange={e => setThickness(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="1.0">1.0 mm</option>
                <option value="1.2">1.2 mm</option>
                <option value="1.5">1.5 mm</option>
                <option value="2.0">2.0 mm</option>
                <option value="3.0">3.0 mm</option>
                <option value="4.0">4.0 mm</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">需求數量 (件)</label>
              <input
                type="number"
                value={qty}
                onChange={e => setQty(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">目標交期時間</label>
              <input
                type="text"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">折床刀模指定要求</label>
              <input
                type="text"
                value={toolingReq}
                onChange={e => setToolingReq(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-slate-400 block mb-1">備註 / 特殊工藝說明</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded text-xs flex items-center justify-center transition shadow-lg shadow-amber-500/20"
          >
            {isSimulating ? (
              <>
                <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                正在進行跨工序瓶頸試算與衝擊分析...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                啟動插單衝擊試算 (Simulate Impact)
              </>
            )}
          </button>
        </div>

        {/* Simulation Output Column */}
        <div className="lg:col-span-7 space-y-4">
          {simulationResult ? (
            <div className="space-y-4">
              {/* Impact Summary Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                    2. 插單影響評估分析
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">總體衝擊等級：</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      中度衝擊 (可藉由最佳化吸收)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">推薦雷射加工指派</span>
                    <span className="text-cyan-400 font-mono font-semibold block mt-0.5">
                      {simulationResult.recommendedSlot.laserMachineId}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">推薦折床加工指派</span>
                    <span className="text-amber-400 font-mono font-semibold block mt-0.5">
                      {simulationResult.recommendedSlot.bendMachineId}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">預估完工交付時間</span>
                    <span className="text-emerald-400 font-mono font-bold block mt-0.5">
                      {simulationResult.recommendedSlot.completionTime}
                    </span>
                  </div>
                </div>

                {simulationResult.delayedOrdersCount > 0 && (
                  <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-300/90 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">排程順延提醒：</span>
                      插單將微幅推遲現有工單 [{simulationResult.delayedOrderIds.join(', ')}] 之預定上機時間約 30~45 分鐘，但均在安全交期寬放區間內，無延遲罰款風險。
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Options Comparison */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  3. 選擇最佳調度處方
                </h3>

                <div className="space-y-2.5">
                  {simulationResult.options.map(opt => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white flex items-center">
                            <span
                              className={`w-3 h-3 rounded-full border mr-2 flex items-center justify-center ${
                                isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                            </span>
                            {opt.title}
                          </span>
                          <span className="font-mono text-xs text-emerald-400 font-semibold">
                            {opt.otdImpact}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mb-2 pl-5">{opt.description}</p>

                        <div className="pl-5 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="text-emerald-400/90 bg-emerald-950/20 p-1.5 rounded border border-emerald-900/30">
                            <span className="font-semibold">優點：</span> {opt.pros}
                          </div>
                          <div className="text-slate-400 bg-slate-900/50 p-1.5 rounded border border-slate-800">
                            <span className="font-semibold text-slate-300">代價：</span> {opt.cons}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Confirm Apply Action */}
                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    onClick={handleConfirmApply}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs flex items-center transition shadow-lg shadow-emerald-500/20"
                  >
                    <FileCheck className="w-4 h-4 mr-1.5" />
                    確認採納此方案並更新甘特排程
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center flex flex-col items-center justify-center h-full min-h-[380px]">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">等待啟動模擬試算</h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                請在左側填入急件規格參數，或直接點選上方的常見範例，系統將為您試算多機台衝擊並提供 3 種平衡方案。
              </p>
              <button
                onClick={runSimulation}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold border border-slate-700 transition"
              >
                直接試算範例急件
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
