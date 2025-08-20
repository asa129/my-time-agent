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

// Create a logger instance
const logger = createPinoLogger({
  name: "my-time-agent",
  level: "info",
});

const agent = new Agent({
  name: "my-time-agent",
  instructions: "あなたは勤怠打刻エージェントです。",
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
