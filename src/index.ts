import "dotenv/config";
import { VoltAgent, VoltOpsClient, Agent } from "@voltagent/core";
import { createPinoLogger } from "@voltagent/logger";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { expenseApprovalWorkflow } from "./workflows";
import { mistral } from "@ai-sdk/mistral";
import {
  checkTool,
  clickTool,
  getTextTool,
  hoverTool,
  pressKeyTool,
  selectOptionTool,
  typeTool,
  uncheckTool,
  waitForElementTool,
} from "./tools";
import z from "zod";

// Create a logger instance
const logger = createPinoLogger({
  name: "my-time-agent",
  level: "info",
});

const agent = new Agent({
  name: "my-time-agent",
  instructions: `あなたは勤怠打刻エージェントです。
  以下のサイトにアクセスして、勤怠打刻を行ってください。
  https://login.ta.kingoftime.jp/admin
  
  操作は下記の手順で実施してください。
  1. ログイン(環境変数のIDとパスワードを使用)
  2. 本日の勤怠を入力してください。
  3. 勤怠時間は出勤09:00、休憩開始12:00、休憩終了13:00です。
  4. 退勤時間は打刻時刻の丸め15分で入力してください。
  例えば、18:26分は18:30分と入力してください。
  5. 保存後はログアウトしてください。`,
  parameters: z.string().describe("IDとパスワード"),
  llm: new VercelAIProvider(),
  model: mistral("mistral-large-latest"),
  tools: [
    clickTool,
    typeTool,
    getTextTool,
    selectOptionTool,
    checkTool,
    uncheckTool,
    hoverTool,
    pressKeyTool,
    waitForElementTool,
  ],
});

new VoltAgent({
  agents: {
    agent,
  },
  workflows: {
    expenseApprovalWorkflow,
  },
  logger,
});
