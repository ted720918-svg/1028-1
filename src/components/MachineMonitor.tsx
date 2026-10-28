import React, { useState } from 'react';
import { 
  Cpu, 
  Activity, 
  Wrench, 
  User, 
  Gauge, 
  AlertCircle, 
  CheckCircle2, 
  Power, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { Machine, MachineStatus, RoutingStage } from '../types';

interface MachineMonitorProps {
  machines: Machine[];
  onUpdateMachineStatus: (machineId: string, newStatus: MachineStatus) => void;
}

export const MachineMonitor: React.FC<MachineMonitorProps> = ({
  machines,
  onUpdateMachineStatus,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('ALL');

  const filteredMachines = machines.filter(m => {
    if (selectedStage === 'ALL') return true;
    return m.stage === selectedStage;
  });

  const getStatusBadge = (status: MachineStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            運轉生產中
          </span>
        );
      case 'setup':
        return (
          <span className="flex items-center text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-ping" />
            換模/調機中
          </span>
        );
      case 'idle':
        return (
          <span className="flex items-center text-xs font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5" />
            待機待料
          </span>
        );
      case 'maintenance':
        return (
          <span className="flex items-center text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
            保養維修
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Telemetry Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center">
            <Cpu className="w-4 h-4 mr-2 text-amber-400" />
            現場設備即時監控看板 (Shop Floor SCADA / MES Telemetry)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            即時呈現各機台加工進度、刀模氣體配置、操作技師與 OEE 稼動率；支援模擬現場狀態切換回報。
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded border border-slate-800 text-xs">
          {[
            { id: 'ALL', label: '全廠機台' },
            { id: 'LASER', label: '雷射切' },
            { id: 'BEND', label: 'CNC折床' },
            { id: 'WELD', label: '焊接站' },
            { id: 'COAT', label: '烤漆線' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedStage(f.id)}
              className={`px-3 py-1 rounded transition-colors ${
                selectedStage === f.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachines.map(machine => {
          return (
            <div
              key={machine.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 transition shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {machine.code}
                      </span>
                      <h3 className="text-sm font-bold text-white">{machine.name}</h3>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {machine.model} · {machine.tonnageOrPower}
                    </div>
                  </div>
                  <div>{getStatusBadge(machine.status)}</div>
                </div>

                {/* Machine Spec */}
                <div className="text-[11px] text-slate-500 bg-slate-950/60 p-2 rounded border border-slate-800/80 mb-3 font-mono">
                  {machine.spec}
                </div>

                {/* Current Job section */}
                <div className="space-y-2 mb-4 text-xs">
                  {machine.currentJobId ? (
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                        <span className="flex items-center font-mono">
                          <Activity className="w-3 h-3 mr-1 text-cyan-400" />
                          當前加工工單：{machine.currentJobId}
                        </span>
                        <span className="text-emerald-400 font-mono font-semibold">加工中</span>
                      </div>
                      <div className="font-medium text-white text-xs truncate">
                        {machine.currentPartName}
                      </div>
                      <div className="flex items-center space-x-2 mt-1.5 text-[11px] font-mono">
                        <span className="text-amber-400 font-semibold">
                          {machine.currentMaterial} {machine.currentThickness}mm
                        </span>
                        <span>·</span>
                        <span className="text-slate-300 truncate">
                          {machine.currentTooling || '標準配置'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 p-3 rounded border border-slate-800/60 text-center text-slate-500 text-xs">
                      目前無上機生產作業 (待命中)
                    </div>
                  )}

                  {/* Operator & Telemetry */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 flex items-center">
                      <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      責任技師：<span className="text-slate-200 ml-1">{machine.operator}</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      OEE {machine.oee}%
                    </span>
                  </div>

                  {/* OEE Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        machine.oee >= 80 ? 'bg-emerald-400' : machine.oee >= 65 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${machine.oee}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Simulator Controls */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                  現場狀況回報模擬 (MES 即時事件)：
                </div>
                <div className="grid grid-cols-4 gap-1 text-[11px]">
                  <button
                    onClick={() => onUpdateMachineStatus(machine.id, 'running')}
                    className={`py-1 rounded font-medium transition ${
                      machine.status === 'running'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    生產中
                  </button>
                  <button
                    onClick={() => onUpdateMachineStatus(machine.id, 'setup')}
                    className={`py-1 rounded font-medium transition ${
                      machine.status === 'setup'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    換模中
                  </button>
                  <button
                    onClick={() => onUpdateMachineStatus(machine.id, 'idle')}
                    className={`py-1 rounded font-medium transition ${
                      machine.status === 'idle'
                        ? 'bg-yellow-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    待機
                  </button>
                  <button
                    onClick={() => onUpdateMachineStatus(machine.id, 'maintenance')}
                    className={`py-1 rounded font-medium transition ${
                      machine.status === 'maintenance'
                        ? 'bg-red-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    保養
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
