import React, { useState } from 'react';
import { 
  Layers, 
  Maximize2, 
  Sparkles, 
  Percent, 
  Tag, 
  Barcode, 
  CheckCircle, 
  Scissors,
  TrendingUp,
  Box
} from 'lucide-react';
import { MOCK_NESTING_SHEETS } from '../data/mockData';
import { NestingSheet, MaterialType } from '../types';

export const NestingHub: React.FC = () => {
  const [selectedSheet, setSelectedSheet] = useState<NestingSheet>(MOCK_NESTING_SHEETS[0]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('ALL');

  const filteredSheets = MOCK_NESTING_SHEETS.filter(s => {
    if (selectedMaterial === 'ALL') return true;
    return s.material === selectedMaterial;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center">
            <Layers className="w-4 h-4 mr-2 text-cyan-400" />
            雷射排版套料與板材餘料中心 (Nesting Layout & Remnant Hub)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            智慧排程系統將相同材質與板厚（如 SUS304 2.0mm）之多張工單合流，進行多工件混排套料 (Co-Nesting) 與共邊切割 (Common Line Cutting)，提升材料利用率並追蹤回收大尺寸餘料。
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">材質篩選：</span>
          <div className="flex items-center bg-slate-950 p-1 rounded border border-slate-800">
            {['ALL', 'SPCC', 'SUS304', 'AL5052', 'SPHC'].map(m => (
              <button
                key={m}
                onClick={() => setSelectedMaterial(m)}
                className={`px-2.5 py-1 rounded transition ${
                  selectedMaterial === m ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-column view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Interactive SVG Plate Nesting Simulation */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                  {selectedSheet.id}
                </span>
                <span className="text-sm font-bold text-white">
                  {selectedSheet.material} {selectedSheet.thickness}mm 雷射套料大板排版圖
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                機台：{selectedSheet.machineCode} · 鋼板規格：{selectedSheet.sheetDimension}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">板材利用率 (Yield)</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                {selectedSheet.utilizationRate}%
              </span>
            </div>
          </div>

          {/* Interactive SVG Plate Canvas */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
              <span>◄ 寬度 1250 mm ►</span>
              <span className="text-cyan-400 flex items-center">
                <Scissors className="w-3 h-3 mr-1" />
                共邊切割已套用 (減少穿孔 28 處)
              </span>
              <span>◄ 長度 2500 mm ►</span>
            </div>

            {/* SVG Visual Plate Rendering */}
            <svg
              viewBox="0 0 800 400"
              className="w-full h-auto bg-slate-900/80 rounded border border-slate-700/80 shadow-inner"
            >
              {/* Sheet outline */}
              <rect x="10" y="10" width="780" height="380" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="4" />

              {/* Grid texture */}
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <rect x="10" y="10" width="780" height="380" fill="url(#grid)" />

              {/* Nested Part A: Server Chassis Base (WO-0841) */}
              <g>
                <rect x="25" y="25" width="220" height="160" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" rx="2" />
                <text x="135" y="95" fill="#bae6fd" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  WO-0841 (主機底盤)
                </text>
                <text x="135" y="115" fill="#7dd3fc" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  1220 x 840 mm
                </text>
                {/* Honeycomb ventilation holes */}
                <circle cx="50" cy="50" r="4" fill="#38bdf8" />
                <circle cx="65" cy="50" r="4" fill="#38bdf8" />
                <circle cx="80" cy="50" r="4" fill="#38bdf8" />
                <circle cx="50" cy="65" r="4" fill="#38bdf8" />
                <circle cx="65" cy="65" r="4" fill="#38bdf8" />
                <circle cx="80" cy="65" r="4" fill="#38bdf8" />
              </g>

              {/* Nested Part A-2 (Common cut shared edge) */}
              <g>
                <rect x="25" y="195" width="220" height="160" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" rx="2" />
                <text x="135" y="265" fill="#bae6fd" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  WO-0841 (底盤#2)
                </text>
                <text x="135" y="285" fill="#7dd3fc" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  共邊切割 (Common Cut)
                </text>
                <line x1="25" y1="190" x2="245" y2="190" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
              </g>

              {/* Nested Part B: 1U Server Top Covers (WO-0847) */}
              <g>
                <rect x="255" y="25" width="180" height="110" fill="#6366f1" fillOpacity="0.25" stroke="#818cf8" strokeWidth="1.5" rx="2" />
                <text x="345" y="75" fill="#c7d2fe" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  WO-0847 (上蓋#1)
                </text>
                <rect x="255" y="145" width="180" height="110" fill="#6366f1" fillOpacity="0.25" stroke="#818cf8" strokeWidth="1.5" rx="2" />
                <text x="345" y="195" fill="#c7d2fe" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  WO-0847 (上蓋#2)
                </text>
                <rect x="255" y="265" width="180" height="110" fill="#6366f1" fillOpacity="0.25" stroke="#818cf8" strokeWidth="1.5" rx="2" />
                <text x="345" y="315" fill="#c7d2fe" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  WO-0847 (上蓋#3)
                </text>
              </g>

              {/* Nested Part C: Small Reinforcement Brackets (Gap Fillers) */}
              {Array.from({ length: 6 }).map((_, i) => (
                <g key={i}>
                  <rect x="445" y={25 + i * 45} width="85" height="38" fill="#10b981" fillOpacity="0.25" stroke="#34d399" strokeWidth="1.5" rx="2" />
                  <text x="487" y={48 + i * 45} fill="#a7f3d0" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    補強角鐵
                  </text>
                </g>
              ))}

              {/* Usable Remnant Zone (剩料餘料區塊) */}
              {selectedSheet.remnantAvailable && (
                <g>
                  <rect x="540" y="25" width="240" height="350" fill="#f59e0b" fillOpacity="0.12" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" rx="3" />
                  <text x="660" y="180" fill="#fcd34d" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    【高價值可回收餘料】
                  </text>
                  <text x="660" y="205" fill="#fde68a" fontSize="11" fontFamily="monospace" textAnchor="middle">
                    {selectedSheet.remnantSize}
                  </text>
                  <text x="660" y="228" fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle">
                    系統已自動產生入庫條碼：REM-2026-99
                  </text>
                </g>
              )}
            </svg>

            {/* Cut Info Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
              <span>預估雷射切斷總工時：<strong className="text-white">{selectedSheet.cutTimeMinutes} 分鐘</strong></span>
              <span>廢料率 (骨架邊角料)：<strong className="text-amber-400">{selectedSheet.scrapRate}%</strong></span>
              <span>排版工件總數：<strong className="text-emerald-400">{selectedSheet.partsCount} 件</strong></span>
            </div>
          </div>

          {/* Quick Sheet Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {filteredSheets.map(sheet => {
              const isSelected = selectedSheet.id === sheet.id;
              return (
                <button
                  key={sheet.id}
                  onClick={() => setSelectedSheet(sheet)}
                  className={`p-2.5 rounded border text-left transition ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-mono font-bold text-white text-[11px]">{sheet.id}</div>
                  <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                    {sheet.material} {sheet.thickness}mm
                  </div>
                  <div className="text-[11px] text-emerald-400 font-bold mt-1">
                    利用率 {sheet.utilizationRate}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Remnant Plate Inventory & Material Savings */}
        <div className="lg:col-span-5 space-y-4">
          {/* Material Cost ROI Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              排程集中套料效益分析 (APS Cost Impact)
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              板金工廠原材料（尤其是 SUS304 不鏽鋼與 AL5052 鋁板）佔總製造成本 45%~60%。藉由智慧排程將相同厚度聚集共編套料：
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block text-[11px]">傳統隨機排程平均利用率</span>
                <span className="text-slate-300 font-bold text-sm block mt-0.5">78.4%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-emerald-500/30">
                <span className="text-emerald-400 block text-[11px]">APS 集中套料利用率</span>
                <span className="text-emerald-400 font-bold text-sm block mt-0.5">89.6% (+11.2%)</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-300">
              💰 預估每週為工廠節省鋼材耗損 <strong>約 NT$ 48,500 元</strong>，穿孔噴嘴壽命延長 18%。
            </div>
          </div>

          {/* Remnant Plate Stock (剩料餘料追蹤) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                <Barcode className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                廠內有效剩料庫存庫位 (Usable Remnants)
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">庫存 4 件</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { id: 'REM-2026-99', mat: 'SPCC 1.5mm', size: '420 x 1250 mm', loc: '料架 A-03', status: '待命中', usable: true },
                { id: 'REM-2026-98', mat: 'SUS304 2.0mm', size: '580 x 950 mm', loc: '料架 B-01', status: '已被急件預約', usable: false },
                { id: 'REM-2026-97', mat: 'SPHC 3.0mm', size: '620 x 1500 mm', loc: '料架 A-08', status: '待命中', usable: true },
                { id: 'REM-2026-96', mat: 'AL5052 2.0mm', size: '450 x 800 mm', loc: '料架 C-02', status: '待命中', usable: true },
              ].map(rem => (
                <div key={rem.id} className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-amber-400">{rem.id}</span>
                      <span className="text-white font-medium">{rem.mat}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      尺寸：{rem.size} · 儲位：{rem.loc}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                        rem.usable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rem.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
