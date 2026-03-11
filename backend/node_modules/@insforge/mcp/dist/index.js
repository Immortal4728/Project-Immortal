#!/usr/bin/env node
import {
  registerInsforgeTools
} from "./chunk-3S2HFIGS.js";

// src/stdio/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { program } from "commander";
program.option("--api_key <value>", "API Key");
program.option("--api_base_url <value>", "API Base URL");
program.parse(process.argv);
var options = program.opts();
var { api_key, api_base_url } = options;
async function main() {
  const server = new McpServer({
    name: "insforge-mcp",
    version: "1.0.0"
  });
  const toolsConfig = await registerInsforgeTools(server, {
    apiKey: api_key,
    apiBaseUrl: api_base_url || process.env.API_BASE_URL
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Insforge MCP server started");
  if (toolsConfig.apiKey) {
    console.error(`API Key: Configured`);
  } else {
    console.error("API Key: Not configured (will require api_key in tool calls)");
  }
  console.error(`API Base URL: ${toolsConfig.apiBaseUrl}`);
  if (toolsConfig.backendVersion) {
    console.error(`Backend Version: ${toolsConfig.backendVersion}`);
  }
  console.error(`Tools registered: ${toolsConfig.toolCount}`);
}
main().catch(console.error);
