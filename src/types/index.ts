export type MaterialType = 'SPCC' | 'SECC' | 'SUS304' | 'AL5052' | 'SPHC';

export type PriorityLevel = 'urgent' | 'high' | 'normal' | 'low';

export type RoutingStage = 
  | 'LASER'       // 雷射切割 / Laser Cutting
  | 'DEBURR'      // 去毛邊 / Deburring
  | 'BEND'        // CNC折床 / Press Brake
  | 'TAP_RIVET'   // 攻牙/植釘 / Tapping & PEM
  | 'WELD'        // 焊接 / Welding
  | 'COAT'        // 表面塗裝 / Powder Coating
  | 'QC_PACK';    // 品檢包裝 / Inspection & Packing

export type MachineStatus = 'running' | 'idle' | 'setup' | 'maintenance';

export interface Machine {
  id: string;
  name: string;
  code: string;
  stage: RoutingStage;
  status: MachineStatus;
  model: string;
  spec: string;
  tonnageOrPower?: string; // e.g. "10kW 光纖" or "100 噸"
  currentJobId?: string | null;
  currentPartName?: string | null;
  currentMaterial?: MaterialType;
  currentThickness?: number;
  currentTooling?: string; // e.g. "V12 下模", "高壓氮氣噴嘴 1.5"
  operator: string;
  utilization: number; // 0-100%
  oee: number; // 0-100%
  activeSetupMinutesLeft?: number;
}

export interface RoutingStep {
  stage: RoutingStage;
  stageName: string;
  assignedMachineId: string;
  estimatedMinutes: number;
  setupMinutes: number;
  toolingRequirement?: string;
  bendStages?: number; // 折彎刀數
  status: 'pending' | 'in_progress' | 'completed';
}

export interface WorkOrder {
  id: string;
  partNumber: string;
  partName: string;
  customer: string;
  material: MaterialType;
  thickness: number; // mm
  blankSize: string; // e.g. "1200 x 600 mm"
  qty: number; // 件數
  priority: PriorityLevel;
  dueDate: string; // YYYY-MM-DD HH:mm
  releaseDate: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'delayed';
  routing: RoutingStep[];
  nestingYield: number; // 套料利用率 %
  isRushOrder?: boolean;
  notes?: string;
}

export interface ScheduledBlock {
  id: string;
  orderId: string;
  partNumber: string;
  partName: string;
  customer: string;
  stage: RoutingStage;
  machineId: string;
  startHour: number; // 8.0 = 08:00
  durationHours: number;
  isSetup: boolean;
  setupReason?: string;
  material: MaterialType;
  thickness: number;
  toolingReq?: string;
  qty: number;
  dueDate: string;
  priority: PriorityLevel;
  isDelayed?: boolean;
  color: string;
}

export type SchedulingStrategy =
  | 'CLUSTER_MATERIAL_THICKNESS' // 材質厚度批次聚合 (減少雷切換氣換料，提升套料共邊率)
  | 'MINIMIZE_TOOLING_SETUP'     // 折床換模最小化 (刀模V槽集中化)
  | 'EARLIEST_DUE_DATE'          // 交期優先 (EDD)
  | 'LOAD_BALANCING'             // 設備負載平衡
  | 'AI_HYBRID_OPTIMAL';         // AI 綜合權衡最佳化

export interface ScheduleMetrics {
  totalOrders: number;
  scheduledOrders: number;
  delayedOrders: number;
  onTimeDeliveryRate: number; // %
  totalSetupTimeMinutes: number; // 總換模換料耗時
  laserSetupTimeMinutes: number;
  bendingSetupTimeMinutes: number;
  avgMaterialUtilization: number; // %
  avgOee: number; // %
  estimatedMakespanHours: number; // 總完工跨度小時
}

export interface NestingSheet {
  id: string;
  material: MaterialType;
  thickness: number;
  sheetDimension: string; // "1250 x 2500 mm"
  utilizationRate: number; // 89.2%
  scrapRate: number; // 10.8%
  partsCount: number;
  assignedOrderIds: string[];
  machineCode: string;
  cutTimeMinutes: number;
  remnantAvailable: boolean;
  remnantSize?: string;
}

export interface WhatIfSimulationResult {
  newOrder: WorkOrder;
  impactScore: 'low' | 'medium' | 'high';
  delayedOrdersCount: number;
  delayedOrderIds: string[];
  additionalSetupMinutes: number;
  recommendedSlot: {
    laserMachineId: string;
    bendMachineId: string;
    startHour: number;
    completionTime: string;
  };
  options: {
    id: string;
    title: string;
    description: string;
    pros: string;
    cons: string;
    addedSetupMinutes: number;
    delayImpactCount: number;
    otdImpact: string;
  }[];
}
