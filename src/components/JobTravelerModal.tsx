import React from 'react';
import { Printer, X, CheckSquare, Barcode, Wrench, ShieldCheck, Layers } from 'lucide-react';
import { WorkOrder } from '../types';

interface JobTravelerModalProps {
  order: WorkOrder | null;
  onClose: () => void;
}

export const JobTravelerModal: React.FC<JobTravelerModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-3xl w-full p-6 shadow-2xl relative my-8 text-slate-200">
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              現場作業專用
            </span>
            <span className="text-sm font-bold text-white">製造工令派工單 (Job Traveler)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center transition"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              列印派工單
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div className="bg-white text-slate-900 p-6 rounded shadow border border-slate-300 font-sans text-xs space-y-4 print:p-0 print:border-none print:shadow-none">
          {/* Top Title Banner */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                智慧精密鈑金製造中心 · 現場製造派工單
              </h2>
              <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                SMART SHEET METAL FABRICATION ROUTING TRAVELER
              </div>
            </div>

            {/* Pseudo Barcode */}
            <div className="text-right flex flex-col items-end">
              <div className="font-mono text-xs font-bold text-slate-800 tracking-widest bg-slate-100 px-2 py-0.5 border border-slate-300">
                * {order.id} *
              </div>
              <div className="h-6 w-32 bg-slate-900 mt-1 flex items-center justify-center text-[9px] text-white font-mono tracking-widest">
                |||| | ||||| ||| ||||
              </div>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 border border-slate-200 rounded text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">工單編號：</span>
              <strong className="font-mono text-sm text-slate-900">{order.id}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">客戶名稱：</span>
              <strong className="text-slate-900">{order.customer}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">產品料號：</span>
              <strong className="font-mono text-slate-900">{order.partNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">需求數量：</span>
              <strong className="font-mono text-sm text-blue-700">{order.qty} 件</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">材質規格：</span>
              <strong className="font-mono text-slate-900">{order.material}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">鋼板厚度：</span>
              <strong className="font-mono text-slate-900">{order.thickness} mm</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">展開落料尺寸：</span>
              <strong className="font-mono text-slate-900">{order.blankSize}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">約定交付交期：</span>
              <strong className="font-mono text-red-600">{order.dueDate}</strong>
            </div>
          </div>

          {/* Part Name & Special notes */}
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950">
            <span className="font-bold">品名：{order.partName}</span>
            <p className="mt-0.5 text-[11px] text-amber-900 leading-relaxed">
              <strong>工藝注意事項：</strong> {order.notes || '無特殊備註，請遵守首件送檢規程。'}
            </p>
          </div>

          {/* Routing Table */}
          <div>
            <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
              <span>製程工藝路線與檢驗簽核表 (Manufacturing Routing Steps)</span>
              <span className="text-[10px] text-slate-500 font-normal">每站完工請作業員簽名並過站報工</span>
            </div>

            <table className="w-full text-left text-[11px] border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-12 text-center">序號</th>
                  <th className="p-2 border-r border-slate-300 w-24">工藝工序</th>
                  <th className="p-2 border-r border-slate-300 w-28">指定機台</th>
                  <th className="p-2 border-r border-slate-300">刀具/模具/參數要求</th>
                  <th className="p-2 border-r border-slate-300 w-20 text-center">預估工時</th>
                  <th className="p-2 border-r border-slate-300 w-20 text-center">作業員簽名</th>
                  <th className="p-2 w-20 text-center">品檢確認</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.routing.map((step, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border-r border-slate-300 font-mono text-center font-bold">
                      {idx + 1}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-bold text-slate-800">
                      {step.stageName}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-mono text-slate-700">
                      {step.assignedMachineId}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-slate-700">
                      {step.toolingRequirement || '標準配置作業'}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono text-slate-700">
                      {step.estimatedMinutes} 分
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono text-slate-400">
                      [________]
                    </td>
                    <td className="p-2 text-center font-mono text-slate-400">
                      [ QC合格 ]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signoff footer */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-300 text-[11px] text-slate-600">
            <div>生管排程核准：_______________</div>
            <div>製造課長放行：_______________</div>
            <div>品質主管複核：_______________</div>
          </div>
        </div>
      </div>
    </div>
  );
};
