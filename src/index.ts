import "dotenv/config";
import { VoltAgent, VoltOpsClient, Agent } from "@voltagent/core";
import { createPinoLogger } from "@voltagent/logger";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { expenseApprovalWorkflow } from "./workflows";
import { mistral } from "@ai-sdk/mistral";
import {
  checkTool,
  clickTool,
  closeBrowserTool,
  getTextTool,
  goBackTool,
  goForwardTool,
  hoverTool,
  navigationTool,
  pressKeyTool,
  refreshPageTool,
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
  必ずツールを使用して実際に操作を実行してください。
  
  操作は下記の手順で実施してください。
  1. ブラウザを開いて、下さい。
  2. URLバーにhttps://login.ta.kingoftime.jp/adminを入力して更新してください。
  3. ログイン(環境変数のYOUR_IDとYOUR_PASSWORDを使用)
  4. 本日の勤怠を入力してください。
  5. 勤怠時間は出勤09:00、休憩開始12:00、休憩終了13:00です。
  6. 退勤時間は打刻時刻の丸め15分で入力してください。
  例えば、18:26分は18:30分と入力してください。
  7. 保存後はログアウトしてください。
  
  ※注意事項
  * 絶対に、同意を求めないでください。手順通りに進めて下さい。
  * 何らかの理由で、手順通りに行えない場合は、その旨を説明して下さい。
  * ログイン時の各要素はlogin_idとlogin_password、login_buttonで定義されています。
  `,
  llm: new VercelAIProvider(),
  parameters: z.object({
    YOUR_ID: z.string().describe("ユーザーID"),
    YOUR_PASSWORD: z.string().describe("パスワード"),
  }),
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
    navigationTool,
    goBackTool,
    goForwardTool,
    refreshPageTool,
    closeBrowserTool,
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
