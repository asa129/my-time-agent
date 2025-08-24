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
  1. ブラウザを開いて下さい。
  2. URLバーにhttps://login.ta.kingoftime.jp/adminを入力して更新してください。
  3. ログイン
  4. 日付を含む行を特定
  - セレクタ: "//td[contains(text(),'MM/DD')]/../td[1]//select[@class='htBlock-selectOther']"
  - または: "//td[contains(text(),'MM/DD')]/preceding-sibling::td[contains(@class,'htBlock-adjastableTableF_actionRow')]//select"
  5.特定した行から、日付セルの左隣にあるセレクトを特定、
  6. セレクトボックスで「打刻編集」を選択
  - インデックス: （インデックス1または値"#button_"で始まるオプション）
  - テキスト: "打刻編集"
  - 部分一致: contains(text(), '打刻編集')
  7. 勤怠時間は出勤09:00、休憩開始12:00、休憩終了13:00です。
  8. 退勤時間は打刻時刻の丸め15分で入力してください。
  例えば、18:26分は18:30分と入力してください。
  9. 保存後はログアウトしてください。
  
  ※注意事項
  * 絶対に、同意を求めないでください。手順通りに進めて下さい。
  * 何らかの理由で、手順通りに行えない場合は、その旨を説明して下さい。
  * ログイン時の各要素はlogin_idとlogin_password、login_buttonで定義されています。
  * 実行中はブラウザ操作をユーザーに見せてください。
  * 各操作を行う際は、必ず操作を終えてから3秒まって次の操作へ進めて下さい。
  * 入力操作は必ず、入力する値を確認してから実行してください。
  * 今日の日付はMM/DD形式で表示されています。
  * クリックする要素は「打刻編集」（「編集申請」ではない）
  * 「打刻編集」のoptionセレクタは#button_XXXXXXXXXXXXX(Xは数値)
  * 要素が見つからない場合は、まずページ全体のテキストを確認してから正しいセレクタを特定する
  * 各操作後は3秒待機
  * エラーが発生したら、別のセレクタ（CSSセレクタやより具体的なXPath）を試す
  `,
  llm: new VercelAIProvider(),
  parameters: z.object({
    CURRENT_DATE: z.string().describe("今日の日付"),
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
