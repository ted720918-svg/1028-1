import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Layers, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Machine, ScheduledBlock, SchedulingStrategy, ScheduleMetrics, RoutingStage, WorkOrder } from '../types';

interface GanttScheduleProps {
  machines: Machine[];
  blocks: ScheduledBlock[];
  metrics: ScheduleMetrics;
  currentStrategy: SchedulingStrategy;
  onStrategyChange: (strategy: SchedulingStrategy) => void;
  workOrders: WorkOrder[];
  onSelectOrder: (order: WorkOrder) => void;
}

export const GanttSchedule: React.FC<GanttScheduleProps> = ({
  machines,
  blocks,
  metrics,
  currentStrategy,
  onStrategyChange,
  workOrders,
  onSelectOrder,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [timeZoom, setTimeZoom] = useState<'12h' | '24h' | '36h'>('24h');
  const [hoveredBlock, setHoveredBlock] = useState<ScheduledBlock | null>(null);

  // Time window setup
  const startHour = 8; // 08:00
  const totalHours = timeZoom === '12h' ? 12 : timeZoom === '24h' ? 24 : 36;
  const pixelsPerHour = timeZoom === '12h' ? 110 : timeZoom === '24h' ? 65 : 45;

  const strategies: { id: SchedulingStrategy; label: string; desc: string; icon: string }[] = [
    {
      id: 'CLUSTER_MATERIAL_THICKNESS',
      label: '材質厚度聚合 (雷切首選)',
      desc: '依板材與厚度集中排產，大幅提升雷射套料共邊率，減少換氣/更換噴嘴工時',
      icon: '📐',
    },
    {
      id: 'MINIMIZE_TOOLING_SETUP',
      label: '折床換模最小化',
      desc: '按刀模V槽規格分群加工，避免折床頻繁拆卸上模與下模，消除調機停等',
      icon: '⚙️',
    },
    {
      id: 'EARLIEST_DUE_DATE',
      label: '交期優先 (EDD)',
      desc: '嚴格按交期先後與急件順序排程，將客戶逾期交付風險降至最低',
      icon: '⏱️',
    },
    {
      id: 'LOAD_BALANCING',
      label: '機台負載均衡',
      desc: '雷射與折床多機群平滑分流派工，消除前後製程積壓與設備飢餓',
      icon: '⚖️',
    },
    {
      id: 'AI_HYBRID_OPTIMAL',
      label: 'AI 綜合權衡最佳化',
      desc: '動態權衡交期懲罰、換模成本與套料利用率之綜合最優解 (推薦)',
      icon: '🤖',
    },
  ];

  const filteredMachines = machines.filter(m => {
    if (stageFilter === 'ALL') return true;
    return m.stage === stageFilter;
  });

  const getStageLabel = (stage: RoutingStage) => {
    switch (stage) {
      case 'LASER': return '雷射切割';
      case 'DEBURR': return '去毛邊';
      case 'BEND': return 'CNC折床';
      case 'TAP_RIVET': return '壓鉚攻牙';
      case 'WELD': return '焊接加工';
      case 'COAT': return '粉體塗裝';
      case 'QC_PACK': return '品檢包裝';
    }
  };

  const formatHourToTime = (hour: number) => {
    const day = Math.floor(hour / 24);
    const dayHour = Math.floor(hour % 24);
    const minutes = Math.round((hour - Math.floor(hour)) * 60);
    const timeStr = `${dayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    if (day > 0) {
      return `第${day + 1}天 ${timeStr}`;
    }
    return timeStr;
  };

  return (
    <div className="space-y-4">
      {/* Top Strategy Selector Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white flex items-center">
                <SlidersHorizontal className="w-4 h-4 mr-1.5 text-amber-400" />
                智慧排程核心演算法策略
              </span>
              <span className="text-xs text-slate-400">
                (切換策略即時重新計算各機台工序與換模停機塊)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {strategies.find(s => s.id === currentStrategy)?.desc}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">時間展望：</span>
            <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-xs">
              {(['12h', '24h', '36h'] as const).map(zoom => (
                <button
                  key={zoom}
                  onClick={() => setTimeZoom(zoom)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    timeZoom === zoom
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {zoom === '12h' ? '半日 (12H)' : zoom === '24h' ? '全日 (24H)' : '跨日 (36H)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5 Strategy Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {strategies.map(s => {
            const isSelected = currentStrategy === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onStrategyChange(s.id)}
                className={`text-left p-2.5 rounded-md border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-amber-200 shadow-sm ring-1 ring-amber-500/50'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="flex items-center">
                    <span className="mr-1.5">{s.icon}</span>
                    {s.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {s.id === 'CLUSTER_MATERIAL_THICKNESS' && '套料利用率 91.5% · 換料耗時 35分'}
                  {s.id === 'MINIMIZE_TOOLING_SETUP' && '折床換模省 45% · 集中V槽加工'}
                  {s.id === 'EARLIEST_DUE_DATE' && '急件最優先 · OTD 準時率 99.4%'}
                  {s.id === 'LOAD_BALANCING' && '多機群平滑分流 · 產線零等待'}
                  {s.id === 'AI_HYBRID_OPTIMAL' && '最佳綜合解 · 全廠跨度最短'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-xs">
          <div className="text-slate-400 mb-0.5">總排產工單</div>
          <div className="font-mono text-lg font-bold text-white">
            {metrics.scheduledOrders} <span className="text-xs font-normal text-slate-500">筆</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">包含 {workOrders.filter(w => w.priority === 'urgent').length} 筆急件單</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-xs">
          <div className="text-slate-400 mb-0.5">預估準時交付率 (OTD)</div>
          <div className="font-mono text-lg font-bold text-cyan-400">
            {metrics.onTimeDeliveryRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {metrics.delayedOrders > 0 ? `⚠️ ${metrics.delayedOrders} 筆工單可能逾期` : '✓ 無延遲風險'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-xs">
          <div className="text-slate-400 mb-0.5">板材套料平均利用率</div>
          <div className="font-mono text-lg font-bold text-emerald-400">
            {metrics.avgMaterialUtilization}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">優於傳統排程 +4.8%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-xs">
          <div className="text-slate-400 mb-0.5">折床換模總耗時</div>
          <div className="font-mono text-lg font-bold text-amber-400">
            {metrics.bendingSetupTimeMinutes} <span className="text-xs font-normal text-slate-500">分</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">V槽刀模更換累計</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-xs">
          <div className="text-slate-400 mb-0.5">雷射換料換氣耗時</div>
          <div className="font-mono text-lg font-bold text-purple-400">
            {metrics.laserSetupTimeMinutes} <span className="text-xs font-normal text-slate-500">分</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">氣體/噴嘴校正切換</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-xs">
          <div className="text-slate-400 mb-0.5">全廠排產完工跨度 (Makespan)</div>
          <div className="font-mono text-lg font-bold text-slate-200">
            {metrics.estimatedMakespanHours} <span className="text-xs font-normal text-slate-500">小時</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">預估最晚完成時間</div>
        </div>
      </div>

      {/* Gantt Filter & Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 border border-slate-800/80 rounded px-3 py-2 text-xs">
        {/* Stage Filter */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          <span className="text-slate-400 mr-1">工段過濾：</span>
          {[
            { id: 'ALL', label: '全部機台' },
            { id: 'LASER', label: '雷射切割' },
            { id: 'DEBURR', label: '去毛邊' },
            { id: 'BEND', label: 'CNC折床' },
            { id: 'TAP_RIVET', label: '攻牙壓鉚' },
            { id: 'WELD', label: '焊接站' },
            { id: 'COAT', label: '粉體塗裝' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStageFilter(f.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                stageFilter === f.id
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/40 border border-cyan-500 mr-1" />
            雷射
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500 mr-1" />
            折床
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500/40 border border-orange-500 mr-1" />
            焊接
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/40 border border-indigo-500 mr-1" />
            烤漆
          </span>
          <span className="flex items-center text-amber-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-amber-400 bg-amber-400/20 mr-1" />
            換模/換料停機塊
          </span>
          {selectedOrderId && (
            <button
              onClick={() => setSelectedOrderId(null)}
              className="text-amber-400 hover:underline flex items-center font-semibold"
            >
              清除工單高亮 [{selectedOrderId}]
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Gantt Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${320 + totalHours * pixelsPerHour}px` }}>
            {/* Timeline Header */}
            <div className="flex border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20">
              {/* Machine Header Column */}
              <div className="w-80 shrink-0 p-3 text-xs font-semibold text-slate-400 border-r border-slate-800 flex items-center justify-between">
                <span>加工設備機群 (CNC / Laser / Weld)</span>
                <span>機台規格 / 當前刀具</span>
              </div>

              {/* Hours Ruler */}
              <div className="flex-1 flex relative">
                {Array.from({ length: totalHours }).map((_, i) => {
                  const hour = startHour + i;
                  const displayTime = formatHourToTime(hour);
                  const isLunch = hour % 24 === 12;
                  const isOvertime = hour % 24 >= 17 && hour % 24 < 21;
                  const isNightShift = hour % 24 >= 21 || hour % 24 < 8;

                  return (
                    <div
                      key={i}
                      style={{ width: `${pixelsPerHour}px` }}
                      className={`shrink-0 border-r border-slate-800/60 py-2 px-1 text-center font-mono text-[11px] ${
                        isLunch
                          ? 'bg-slate-800/40 text-amber-400 font-medium'
                          : isOvertime
                          ? 'bg-indigo-950/20 text-indigo-300'
                          : isNightShift
                          ? 'bg-slate-950 text-slate-500'
                          : 'text-slate-400'
                      }`}
                    >
                      <div>{displayTime}</div>
                      {isLunch && <span className="text-[9px] block text-amber-400/80">午休</span>}
                      {hour % 24 === 17 && <span className="text-[9px] block text-indigo-400">加班</span>}
                      {hour % 24 === 21 && <span className="text-[9px] block text-purple-400">大夜</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Machine Rows */}
            <div className="divide-y divide-slate-800/60">
              {filteredMachines.map(machine => {
                const machineBlocks = blocks.filter(b => b.machineId === machine.id);

                return (
                  <div key={machine.id} className="flex hover:bg-slate-850/40 transition-colors group">
                    {/* Machine Info Column */}
                    <div className="w-80 shrink-0 p-3 border-r border-slate-800 bg-slate-900/90 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                            {machine.code}
                          </span>
                          <span className="text-xs font-bold text-white truncate max-w-[130px]">
                            {machine.name}
                          </span>
                        </div>
                        {/* Status Light */}
                        <div className="flex items-center space-x-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              machine.status === 'running'
                                ? 'bg-emerald-400 animate-pulse'
                                : machine.status === 'setup'
                                ? 'bg-amber-400 animate-ping'
                                : machine.status === 'idle'
                                ? 'bg-yellow-400'
                                : 'bg-red-400'
                            }`}
                          />
                          <span className="text-[10px] text-slate-400 font-mono">
                            {machine.status === 'running'
                              ? '加工中'
                              : machine.status === 'setup'
                              ? '換模中'
                              : machine.status === 'idle'
                              ? '待機'
                              : '維修'}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 truncate mb-1">
                        {machine.model} · {machine.tonnageOrPower}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="truncate max-w-[150px]">
                          {machine.currentTooling ? `模具: ${machine.currentTooling}` : machine.spec}
                        </span>
                        <span className="text-emerald-400 font-semibold">{machine.utilization}% OEE</span>
                      </div>
                    </div>

                    {/* Timeline Canvas for this machine */}
                    <div className="flex-1 relative h-20 bg-slate-950/40 overflow-hidden">
                      {/* Vertical Hour Guidelines */}
                      {Array.from({ length: totalHours }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            left: `${i * pixelsPerHour}px`,
                            width: `${pixelsPerHour}px`,
                          }}
                          className="absolute inset-y-0 border-r border-slate-800/30 pointer-events-none"
                        />
                      ))}

                      {/* Scheduled Blocks */}
                      {machineBlocks.map(block => {
                        const leftPx = (block.startHour - startHour) * pixelsPerHour;
                        const widthPx = Math.max(18, block.durationHours * pixelsPerHour);
                        const isMatchSelected = selectedOrderId === block.orderId;
                        const isDimmed = selectedOrderId !== null && !isMatchSelected;

                        return (
                          <div
                            key={block.id}
                            style={{
                              left: `${leftPx}px`,
                              width: `${widthPx}px`,
                            }}
                            onClick={() => {
                              setSelectedOrderId(block.orderId);
                              const matched = workOrders.find(w => w.id === block.orderId);
                              if (matched) onSelectOrder(matched);
                            }}
                            onMouseEnter={() => setHoveredBlock(block)}
                            onMouseLeave={() => setHoveredBlock(null)}
                            className={`absolute top-2 bottom-2 rounded cursor-pointer transition-all border flex flex-col justify-center px-2 select-none overflow-hidden ${
                              block.color
                            } ${
                              isMatchSelected
                                ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/20 z-10 scale-[1.02]'
                                : isDimmed
                                ? 'opacity-30'
                                : 'hover:opacity-100 hover:z-10'
                            }`}
                          >
                            {block.isSetup ? (
                              /* Setup Block UI */
                              <div className="flex items-center text-[10px] text-amber-300 font-mono font-bold truncate">
                                <Wrench className="w-3 h-3 mr-1 shrink-0 animate-spin-slow" />
                                <span className="truncate">{block.setupReason || '換模換料'}</span>
                                <span className="ml-1 shrink-0 text-[9px] opacity-80">
                                  ({Math.round(block.durationHours * 60)}m)
                                </span>
                              </div>
                            ) : (
                              /* Operation Block UI */
                              <div className="truncate">
                                <div className="flex items-center space-x-1 text-[11px] font-bold truncate leading-tight">
                                  {block.priority === 'urgent' && (
                                    <span className="bg-red-500 text-white text-[9px] px-1 rounded shrink-0">
                                      急
                                    </span>
                                  )}
                                  <span className="font-mono text-white/90">{block.orderId}</span>
                                  <span className="truncate text-white">{block.partName}</span>
                                </div>
                                <div className="flex items-center space-x-1.5 text-[9px] text-slate-300/80 font-mono truncate mt-0.5">
                                  <span className="font-semibold text-amber-300">
                                    {block.material} {block.thickness}mm
                                  </span>
                                  <span>·</span>
                                  <span>{block.qty}件</span>
                                  {block.toolingReq && (
                                    <>
                                      <span>·</span>
                                      <span className="truncate text-slate-200">{block.toolingReq}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hover / Active Inspector Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          {hoveredBlock ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-mono font-bold text-amber-400">
                {hoveredBlock.isSetup ? '⚙️ 設備整備塊' : `📋 ${hoveredBlock.orderId}`}
              </span>
              <span className="text-white font-medium">{hoveredBlock.partName}</span>
              <span className="text-slate-400">客戶：{hoveredBlock.customer}</span>
              <span className="text-cyan-400 font-mono">
                材質：{hoveredBlock.material} {hoveredBlock.thickness}mm
              </span>
              <span className="text-slate-400 font-mono">數量：{hoveredBlock.qty} 件</span>
              <span className="text-amber-300 font-mono">
                排程起訖：{formatHourToTime(hoveredBlock.startHour)} ~ {formatHourToTime(hoveredBlock.startHour + hoveredBlock.durationHours)}
                ({Math.round(hoveredBlock.durationHours * 60)} 分鐘)
              </span>
              {hoveredBlock.toolingReq && (
                <span className="text-slate-300 font-mono">刀模：{hoveredBlock.toolingReq}</span>
              )}
            </div>
          ) : (
            <div className="text-slate-500 flex items-center">
              <ChevronRight className="w-3.5 h-3.5 mr-1 text-slate-600" />
              提示：將滑鼠懸停於甘特圖區塊可查看工藝與模具明細，點擊任一工單可高亮前後關聯製程。
            </div>
          )}

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-500">當前排程引擎：</span>
            <span className="text-amber-400 font-semibold">{currentStrategy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
