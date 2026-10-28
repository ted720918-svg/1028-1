import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { GanttSchedule } from './components/GanttSchedule';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { MachineMonitor } from './components/MachineMonitor';
import { OrderManager } from './components/OrderManager';
import { NestingHub } from './components/NestingHub';
import { AiAdvisor } from './components/AiAdvisor';
import { JobTravelerModal } from './components/JobTravelerModal';
import { INITIAL_MACHINES, INITIAL_WORK_ORDERS } from './data/mockData';
import { runSchedulingEngine } from './services/schedulingEngine';
import { WorkOrder, Machine, SchedulingStrategy, MachineStatus } from './types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [strategy, setStrategy] = useState<SchedulingStrategy>('AI_HYBRID_OPTIMAL');
  const [activeTab, setActiveTab] = useState<string>('gantt');
  const [selectedTravelerOrder, setSelectedTravelerOrder] = useState<WorkOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>('智慧排程核心已加載完成：當前採用 AI 綜合加權最佳化策略。');

  // Compute schedule blocks & metrics reactively
  const { blocks, metrics } = useMemo(() => {
    return runSchedulingEngine(workOrders, machines, strategy);
  }, [workOrders, machines, strategy]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4500);
  };

  const handleStrategyChange = (newStrategy: SchedulingStrategy) => {
    setStrategy(newStrategy);
    const names: Record<SchedulingStrategy, string> = {
      CLUSTER_MATERIAL_THICKNESS: '材質厚度批次聚合 (減少雷切換料氣體更換)',
      MINIMIZE_TOOLING_SETUP: '折床換模最小化 (刀模V槽集中化加工)',
      EARLIEST_DUE_DATE: '交期優先策略 (EDD 零逾期保證)',
      LOAD_BALANCING: '設備負載平衡 (多機群平滑分流)',
      AI_HYBRID_OPTIMAL: 'AI 綜合權衡最佳化 (帕累托最優平衡)',
    };
    showToast(`已切換排程策略至【${names[newStrategy]}】，產線工序與停機塊已重新計算！`);
  };

  const handleApplyRushOrder = (newOrder: WorkOrder, optionId: string) => {
    setWorkOrders(prev => [newOrder, ...prev]);
    setActiveTab('gantt');
    showToast(`急件工單 [${newOrder.id}] 已成功插入排程！已依據方案智慧分派至雷切與折床。`);
  };

  const handleUpdateMachineStatus = (machineId: string, newStatus: MachineStatus) => {
    setMachines(prev =>
      prev.map(m => (m.id === machineId ? { ...m, status: newStatus } : m))
    );
    const m = machines.find(x => x.id === machineId);
    showToast(`機台 [${m?.code} ${m?.name}] 狀態已更新為：${newStatus === 'running' ? '運轉中' : newStatus === 'setup' ? '換模調機' : newStatus === 'idle' ? '待機' : '保養'}`);
  };

  const handleAddNewOrder = (order: WorkOrder) => {
    setWorkOrders(prev => [order, ...prev]);
    showToast(`新生產工單 [${order.id} - ${order.partName}] 已建立並加入排產池！`);
  };

  const handleBoostPriority = (orderId: string) => {
    setWorkOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, priority: 'urgent', isRushOrder: true } : o))
    );
    showToast(`工單 [${orderId}] 已提升為特急單 (Urgent)，排程引擎已自動前調優先投產！`);
  };

  const handleExportCsv = () => {
    const headers = ['工單編號', '客戶', '零件名稱', '材質', '板厚(mm)', '數量', '交期', '急迫性', '利用率(%)', '狀態'];
    const rows = workOrders.map(o => [
      o.id,
      o.customer,
      `"${o.partName}"`,
      o.material,
      o.thickness,
      o.qty,
      o.dueDate,
      o.priority,
      o.nestingYield,
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SheetMetal_APS_Schedule_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('已匯出排程資料清冊 CSV 檔案！');
  };

  const handleOpenTravelerDemo = () => {
    const target = workOrders.find(w => w.priority === 'urgent') || workOrders[0];
    setSelectedTravelerOrder(target);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md bg-slate-900 border border-amber-500/40 text-amber-200 px-4 py-3 rounded-lg shadow-2xl flex items-center justify-between text-xs animate-slide-up backdrop-blur">
          <div className="flex items-center space-x-2 mr-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Industrial Header */}
      <Header
        metrics={metrics}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTravelerDemo={handleOpenTravelerDemo}
        onExportCsv={handleExportCsv}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'gantt' && (
          <GanttSchedule
            machines={machines}
            blocks={blocks}
            metrics={metrics}
            currentStrategy={strategy}
            onStrategyChange={handleStrategyChange}
            workOrders={workOrders}
            onSelectOrder={order => setSelectedTravelerOrder(order)}
          />
        )}

        {activeTab === 'whatif' && (
          <WhatIfSimulator
            currentOrders={workOrders}
            machines={machines}
            onApplyRushOrder={handleApplyRushOrder}
          />
        )}

        {activeTab === 'machines' && (
          <MachineMonitor
            machines={machines}
            onUpdateMachineStatus={handleUpdateMachineStatus}
          />
        )}

        {activeTab === 'orders' && (
          <OrderManager
            orders={workOrders}
            onOpenTraveler={order => setSelectedTravelerOrder(order)}
            onAddNewOrder={handleAddNewOrder}
            onBoostPriority={handleBoostPriority}
          />
        )}

        {activeTab === 'nesting' && <NestingHub />}

        {activeTab === 'ai' && (
          <AiAdvisor
            orders={workOrders}
            machines={machines}
            metrics={metrics}
            onApplyAiRecommendation={handleStrategyChange}
          />
        )}
      </main>

      {/* Printable Job Traveler Modal */}
      <JobTravelerModal
        order={selectedTravelerOrder}
        onClose={() => setSelectedTravelerOrder(null)}
      />

      {/* Industrial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 px-4 text-center text-xs text-slate-500 font-mono">
        板金製造業智慧排程系統 (SheetMetal APS) · 工業 4.0 智慧排產、套料共邊與折床換模最佳化
      </footer>
    </div>
  );
}
