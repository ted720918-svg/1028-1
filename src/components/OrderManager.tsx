import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Plus, 
  FileText, 
  Flame, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { WorkOrder, MaterialType, PriorityLevel } from '../types';

interface OrderManagerProps {
  orders: WorkOrder[];
  onOpenTraveler: (order: WorkOrder) => void;
  onAddNewOrder: (order: WorkOrder) => void;
  onBoostPriority: (orderId: string) => void;
}

export const OrderManager: React.FC<OrderManagerProps> = ({
  orders,
  onOpenTraveler,
  onAddNewOrder,
  onBoostPriority,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New order form state
  const [newCustomer, setNewCustomer] = useState('台達電子');
  const [newPartName, setNewPartName] = useState('伺服器高密電源背板');
  const [newPartNumber, setNewPartNumber] = useState('DEL-PWR-BKP-01');
  const [newMaterial, setNewMaterial] = useState<MaterialType>('SPCC');
  const [newThickness, setNewThickness] = useState<number>(1.5);
  const [newQty, setNewQty] = useState<number>(150);
  const [newPriority, setNewPriority] = useState<PriorityLevel>('high');
  const [newDueDate, setNewDueDate] = useState('2026-10-15 17:00');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMaterial = materialFilter === 'ALL' || o.material === materialFilter;
    const matchesPriority = priorityFilter === 'ALL' || o.priority === priorityFilter;
    return matchesSearch && matchesMaterial && matchesPriority;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order: WorkOrder = {
      id: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      partNumber: newPartNumber,
      partName: newPartName,
      customer: newCustomer,
      material: newMaterial,
      thickness: newThickness,
      blankSize: '1000 x 600 mm',
      qty: newQty,
      priority: newPriority,
      dueDate: newDueDate,
      releaseDate: new Date().toISOString().slice(0, 10) + ' 08:00',
      status: 'waiting',
      nestingYield: 87.5,
      notes: '標準工件，沖孔密集，折床使用標準刀模。',
      routing: [
        { stage: 'LASER', stageName: '雷射切割', assignedMachineId: 'M-LASER-1', estimatedMinutes: Math.round(newQty * 0.7), setupMinutes: 10, status: 'pending' },
        { stage: 'DEBURR', stageName: '去毛邊', assignedMachineId: 'M-DEBURR-1', estimatedMinutes: 30, setupMinutes: 5, status: 'pending' },
        { stage: 'BEND', stageName: 'CNC折彎', assignedMachineId: 'M-BEND-1', estimatedMinutes: Math.round(newQty * 0.8), setupMinutes: 20, toolingRequirement: '標準 V12 下模', status: 'pending' },
        { stage: 'COAT', stageName: '粉體塗裝', assignedMachineId: 'M-COAT-1', estimatedMinutes: 60, setupMinutes: 15, status: 'pending' },
        { stage: 'QC_PACK', stageName: '品檢包裝', assignedMachineId: 'M-QC-1', estimatedMinutes: 35, setupMinutes: 0, status: 'pending' },
      ],
    };

    onAddNewOrder(order);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="搜尋工單號、零件名稱、料號、客戶..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Material Filter */}
          <select
            value={materialFilter}
            onChange={e => setMaterialFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">全部材質</option>
            <option value="SPCC">SPCC (冷軋鋼)</option>
            <option value="SUS304">SUS304 (不鏽鋼)</option>
            <option value="AL5052">AL5052 (鋁合金)</option>
            <option value="SECC">SECC (鍍鋅板)</option>
            <option value="SPHC">SPHC (熱軋板)</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">全部急迫性</option>
            <option value="urgent">特急件 (Urgent)</option>
            <option value="high">高優先 (High)</option>
            <option value="normal">一般 (Normal)</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition shadow-md shadow-amber-500/20 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          建立新生產工單
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">工單編號 / 料號</th>
                <th className="py-3 px-4">零件名稱 / 客戶</th>
                <th className="py-3 px-4">材質 · 板厚</th>
                <th className="py-3 px-4">數量</th>
                <th className="py-3 px-4">交期</th>
                <th className="py-3 px-4">急迫等級</th>
                <th className="py-3 px-4">工藝工序推進 (Routing)</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredOrders.map(order => {
                return (
                  <tr key={order.id} className="hover:bg-slate-850/50 transition">
                    {/* Order ID */}
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      <div>{order.id}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{order.partNumber}</div>
                    </td>

                    {/* Part Name & Customer */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{order.partName}</div>
                      <div className="text-[11px] text-slate-400">{order.customer}</div>
                    </td>

                    {/* Material & Thickness */}
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-cyan-400">{order.material}</span>
                      <span className="text-slate-400 ml-1.5">{order.thickness} mm</span>
                      <div className="text-[10px] text-slate-500 mt-0.5">套料率 {order.nestingYield}%</div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      {order.qty} <span className="text-[11px] font-normal text-slate-500">件</span>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {order.dueDate}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      {order.priority === 'urgent' ? (
                        <span className="inline-flex items-center text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded">
                          <Flame className="w-3 h-3 mr-1" />
                          特急單
                        </span>
                      ) : order.priority === 'high' ? (
                        <span className="text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                          高優先
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          常態工單
                        </span>
                      )}
                    </td>

                    {/* Routing Stage Badges */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {order.routing.map((r, i) => (
                          <span
                            key={i}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              r.status === 'in_progress'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                                : r.status === 'completed'
                                ? 'bg-slate-800 text-slate-500 line-through'
                                : 'bg-slate-950 text-slate-400 border border-slate-800'
                            }`}
                            title={`${r.stageName} (${r.estimatedMinutes}分)`}
                          >
                            {r.stageName}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onOpenTraveler(order)}
                        className="inline-flex items-center text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition"
                      >
                        <FileText className="w-3 h-3 mr-1 text-slate-400" />
                        派工單
                      </button>
                      {order.priority !== 'urgent' && (
                        <button
                          onClick={() => onBoostPriority(order.id)}
                          className="inline-flex items-center text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30 transition"
                          title="升等為特急單並重新排產"
                        >
                          <Flame className="w-3 h-3 mr-1" />
                          轉急單
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center">
              <Plus className="w-4 h-4 mr-2 text-amber-400" />
              建立板金加工新生產工單
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">客戶名稱</label>
                  <input
                    type="text"
                    required
                    value={newCustomer}
                    onChange={e => setNewCustomer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">產品料號</label>
                  <input
                    type="text"
                    required
                    value={newPartNumber}
                    onChange={e => setNewPartNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">工件品名</label>
                <input
                  type="text"
                  required
                  value={newPartName}
                  onChange={e => setNewPartName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">材質</label>
                  <select
                    value={newMaterial}
                    onChange={e => setNewMaterial(e.target.value as MaterialType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="SPCC">SPCC (冷軋板)</option>
                    <option value="SUS304">SUS304 (不鏽鋼)</option>
                    <option value="AL5052">AL5052 (鋁板)</option>
                    <option value="SECC">SECC (鍍鋅板)</option>
                    <option value="SPHC">SPHC (熱軋板)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">板厚 (mm)</label>
                  <select
                    value={newThickness}
                    onChange={e => setNewThickness(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="1.0">1.0 mm</option>
                    <option value="1.2">1.2 mm</option>
                    <option value="1.5">1.5 mm</option>
                    <option value="2.0">2.0 mm</option>
                    <option value="3.0">3.0 mm</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">數量 (件)</label>
                  <input
                    type="number"
                    min="1"
                    value={newQty}
                    onChange={e => setNewQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">交期時間</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">急迫優先級</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="urgent">特急件 (Urgent)</option>
                    <option value="high">高優先 (High)</option>
                    <option value="normal">一般 (Normal)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white rounded bg-slate-800 text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs shadow-md shadow-amber-500/20"
                >
                  確認建立工單
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
