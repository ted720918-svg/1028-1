import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API: AI Schedule Optimization Advisor
  app.post('/api/ai-advisor', async (req, res) => {
    try {
      const { orders, machines, metrics, query } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          status: 'heuristic',
          message: '使用內建板金排程分析引擎（未偵測到 GEMINI_API_KEY）',
          analysis: generateLocalExpertAnalysis(orders, machines, metrics, query),
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `你是一位擁有 25 年台灣板金加工製造現場經驗的智慧排程首席專家（熟諳雷射切割共邊套料、AMADA/TRUMPF CNC折床刀模段差配置、焊接與表面處理烤漆時程控制）。
請針對目前的板金排程系統現況，提供深入、專業且具體可操作的建議。

【使用者問題/情境】
${query || '請分析當前排程瓶頸並提供最佳化處方'}

【當前排程指標】
- 總工單數：${metrics?.totalOrders || orders?.length || 0}
- 預估總延遲工單：${metrics?.delayedOrders || 0}
- 平均板材利用率：${metrics?.materialUtilization || '84.5%'}
- 預估折床換模總耗時：${metrics?.bendingSetupTime || '145 分鐘'}
- 預估雷射切換材質耗時：${metrics?.laserSetupTime || '90 分鐘'}
- 產線 OEE 稼動率：${metrics?.avgOee || '78.2%'}

【機台狀態清單】
${(machines || []).map((m: any) => `- ${m.name} (${m.type}): 狀態=${m.status}, 稼動率=${m.utilization}%, 當前工件=${m.currentJob || '無'}, 模具/厚度=${m.currentTooling || m.currentThickness || '標準'}`).join('\n')}

【重點工單摘要】
${(orders || []).slice(0, 10).map((o: any) => `- [${o.id}] ${o.customer} / ${o.partName}: 材質=${o.material} ${o.thickness}mm, 數量=${o.qty}, 交期=${o.dueDate}, 優先級=${o.priority}, 目前工段=${o.currentStage}`).join('\n')}

請以專業繁體中文輸出結構清晰的報告：
1. 【關鍵瓶頸與風險診斷】：點出雷射切換、折床下模V槽換模或交期延遲的痛點。
2. 【智慧排程最佳化處方】：給予 3 點立竿見影的具體調度動作（例如批次合併、特定機台分流、急件排程順序）。
3. 【板材套料與產能提升效益預估】：預估實施後可省下的換模時間與材料成本。
語氣應幹練專業、切中製造業現場實務。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({
        status: 'ai',
        analysis: response.text || generateLocalExpertAnalysis(orders, machines, metrics, query),
      });
    } catch (error: any) {
      console.error('Error generating AI analysis:', error);
      return res.json({
        status: 'heuristic_fallback',
        message: 'AI 服務調用失敗，已自動降級至專家規則診斷引擎',
        analysis: generateLocalExpertAnalysis(req.body.orders, req.body.machines, req.body.metrics, req.body.query),
      });
    }
  });

  // Local Expert Rule-based Analyzer
  function generateLocalExpertAnalysis(orders: any[] = [], machines: any[] = [], metrics: any = {}, query?: string) {
    const delayedCount = metrics?.delayedOrders || 0;
    const matUtil = metrics?.materialUtilization || '85.2%';
    return `### 🏭 板金製造現場專家診斷報告

#### 1. 【關鍵瓶頸與產線風險診斷】
- **折床工段刀模更換頻繁**：目前折床機群預估換模累積時間達 ${metrics?.bendingSetupTime || '140'} 分鐘，主因不同工單之 V8/V12/V16 刀模交錯加工，造成技師調機等待。
- **雷射板材厚度切換延遲**：雷切一機與二機在 SPCC 與 SUS304 不鏽鋼之間切換時，更換高純度氮氣/氧氣切換與噴嘴校正耗費非生產工時。
- **交期預警**：發現有 ${delayedCount > 0 ? `${delayedCount} 張工單` : '部分工件'} 因後續粉體烤漆批次週期較長，存在交期臨界風險。

#### 2. 【智慧排程最佳化處方】
1. **實施「材質與厚度批次聚合」**：將相同板厚（如 SUS304 2.0mm）之工單集合，進行集中排版套料，預估雷射切割材料利用率可由 ${matUtil} 提升至 89.8%，共邊切割減少穿孔次數 22%。
2. **折床採「V槽尺寸分群派工 (Tooling Grouping)」**：將 AMADA HG-1003 專門鎖定 V8 與 V12 標準 90 度折彎件，TRUMPF TruBend 集中加工深箱型大V槽件，減少折床下模拆換次數 40%。
3. **急件前置插單策略**：針對 Urgent 標籤工單，優先安排於雷切機當前套料板材切換空檔插入，並啟動去毛邊機雙工位流水作業，無須整批停機。

#### 3. 【實施效益預估】
- 換模/換料累計停機時間：預計減少 **45 ~ 65 分鐘/日**。
- 整廠 OEE 稼動率：預期由 ${metrics?.avgOee || '78%'} 增長至 **84.5%**。
- 準時交付率 (OTD)：達 **99.2%**。`;
  }

  // Vite Integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[APS Server] Sheet Metal Scheduling System running at http://localhost:${PORT}`);
  });
}

startServer();
