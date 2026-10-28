import React from 'react';
import { Calendar, Clock, Activity, Cpu, Layers, Download, Printer } from 'lucide-react';
import { ScheduleMetrics } from '../types';

interface HeaderProps {
  metrics: ScheduleMetrics;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTravelerDemo: () => void;
  onExportCsv: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  activeTab,
  setActiveTab,
  onOpenTravelerDemo,
  onExportCsv,
}) => {
  const [currentTime, setCurrentTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          weekday: 'narrow',
        }) + ' ' + now.toLocaleTimeString('zh-TW', { hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'gantt', label: '甘特排程總覽', icon: Calendar },
    { id: 'whatif', label: '急件插單模擬', icon: Activity, badge: 'What-If' },
    { id: 'machines', label: '設備監控看板', icon: Cpu },
    { id: 'orders', label: '工單排產池', icon: Layers, count: metrics.totalOrders },
    { id: 'nesting', label: '雷射套料與餘料', icon: Layers },
    { id: 'ai', label: 'AI 排程顧問', icon: Activity, pulse: true },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      {/* Top Industrial Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black tracking-wider text-xl">
              SM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  板金製造業智慧排程系統
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                  APS 4.0
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>鈑金一廠 · 精密製造中心</span>
                <span>/</span>
                <span className="text-emerald-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                  MES 連線運轉中
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & System Clock */}
          <div className="hidden lg:flex items-center space-x-6 text-xs">
            {/* OEE Metric */}
            <div className="flex flex-col items-end">
              <span className="text-slate-400">全廠 OEE 稼動率</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {metrics.avgOee}%
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            {/* OTD Metric */}
            <div className="flex flex-col items-end">
              <span className="text-slate-400">預估準時交付率 (OTD)</span>
              <span className="font-mono text-base font-bold text-cyan-400">
                {metrics.onTimeDeliveryRate}%
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            {/* Total Setup Time */}
            <div className="flex flex-col items-end">
              <span className="text-slate-400">預估換模換料總工時</span>
              <span className="font-mono text-base font-bold text-amber-400">
                {metrics.totalSetupTimeMinutes} <span className="text-xs font-normal text-slate-400">分</span>
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            {/* Shift & Time */}
            <div className="flex flex-col items-end">
              <span className="text-slate-400 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                常日班 (08:00 - 17:00)
              </span>
              <span className="font-mono font-medium text-slate-200">
                {currentTime || '2026-10-13 08:30'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenTravelerDemo}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md border border-slate-700 transition"
              title="查看並列印工單製造派工單"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              製造派工單
            </button>
            <button
              onClick={onExportCsv}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md border border-slate-700 transition"
              title="匯出排程資料 (CSV)"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              匯出排程
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-800/80 pt-2 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center whitespace-nowrap px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 mr-1.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                {item.label}
                {item.badge && (
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && (
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.pulse && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
