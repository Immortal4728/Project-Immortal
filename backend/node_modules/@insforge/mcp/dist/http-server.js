#!/usr/bin/env node
import {
  registerInsforgeTools
} from "./chunk-3S2HFIGS.js";

// src/http/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { program } from "commander";
import express from "express";
import { randomUUID } from "crypto";
program.option("--port <number>", "Port to run HTTP server on", "3000");
program.parse(process.argv);
var options = program.opts();
var { port } = options;
var PORT = parseInt(port) || 3e3;
var transports = /* @__PURE__ */ new Map();
var servers = /* @__PURE__ */ new Map();
var app = express();
app.use(express.json({ limit: "10mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, X-Base-URL, Mcp-Session-Id, Last-Event-ID");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    server: "insforge-mcp-streamable",
    version: "1.0.0",
    protocol: "Streamable HTTP",
    sessions: transports.size,
    authentication: "per-request via headers",
    requiredHeaders: {
      "Authorization": "Bearer <API_KEY>",
      "X-Base-URL": "<BACKEND_URL> (e.g. http://localhost:7130)"
    }
  });
});
function isInitializeRequest(body) {
  if (!body) return false;
  if (body.method === "initialize") {
    return true;
  }
  if (Array.isArray(body)) {
    return body.some((req) => req.method === "initialize");
  }
  return false;
}
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] POST /mcp - Session: ${sessionId || "none"}`);
  const authHeader = req.headers["authorization"];
  let apiKey;
  if (authHeader?.startsWith("Bearer ")) {
    apiKey = authHeader.substring(7);
  }
  const apiBaseUrl = req.headers["x-base-url"];
  let transport;
  let mcpServer;
  if (sessionId && transports.has(sessionId)) {
    transport = transports.get(sessionId);
    console.log("Using existing transport for session:", sessionId);
  } else if (isInitializeRequest(req.body)) {
    if (!apiKey) {
      return res.status(401).json({
        error: "Missing required Authorization header. Expected: Authorization: Bearer <API_KEY>"
      });
    }
    if (!apiBaseUrl) {
      return res.status(400).json({
        error: "Missing required X-Base-URL header. Expected: X-Base-URL: <BACKEND_URL>"
      });
    }
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId2) => {
        console.log(`Session initialized: ${sessionId2}`);
        transports.set(sessionId2, transport);
        if (mcpServer) {
          servers.set(sessionId2, mcpServer);
        }
      }
    });
    mcpServer = new McpServer({
      name: "insforge-mcp",
      version: "1.0.0"
    });
    await registerInsforgeTools(mcpServer, {
      apiKey,
      apiBaseUrl
    });
    console.log("Connecting server to transport...");
    await mcpServer.connect(transport);
    console.log("Server connected successfully");
  } else {
    return res.status(400).json({
      error: "Session required. Send initialize request first or provide Mcp-Session-Id header."
    });
  }
  console.log("Handling request with transport...");
  await transport.handleRequest(req, res, req.body);
  console.log("Request handled");
});
app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] GET /mcp - Session: ${sessionId || "none"}`);
  if (!sessionId || !transports.has(sessionId)) {
    return res.status(404).json({
      error: "Session not found. Initialize first with POST request."
    });
  }
  const transport = transports.get(sessionId);
  await transport.handleRequest(req, res, req.body);
});
app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] DELETE /mcp - Session: ${sessionId || "none"}`);
  if (!sessionId || !transports.has(sessionId)) {
    return res.status(404).json({
      error: "Session not found."
    });
  }
  const transport = transports.get(sessionId);
  const server2 = servers.get(sessionId);
  await transport.handleRequest(req, res, req.body);
  if (server2) {
    await server2.close();
    servers.delete(sessionId);
  }
  transports.delete(sessionId);
  console.log(`Session ${sessionId} closed`);
});
var server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551         Insforge MCP Streamable HTTP Server             \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

\u{1F680} Server: http://127.0.0.1:${PORT}
\u{1F517} Endpoint: http://127.0.0.1:${PORT}/mcp
\u{1F49A} Health: http://127.0.0.1:${PORT}/health

\u{1F4CB} Protocol: Streamable HTTP (2024-11-05+ spec)
\u{1F510} Required Headers (per-request):
   \u2022 Authorization: Bearer <API_KEY>
   \u2022 X-Base-URL: <BACKEND_URL>

\u{1F4DD} Client Configuration Example:
{
  "mcpServers": {
    "insforge": {
      "url": "http://127.0.0.1:${PORT}/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY",
        "X-Base-URL": "http://localhost:7130"
      }
    }
  }
}

\u{1F504} Session Management: Automatic (stateful)
\u{1F6E1}\uFE0F  Security: Binding to localhost only (127.0.0.1)
`);
});
process.on("SIGINT", async () => {
  console.log("\n\u{1F6D1} Shutting down server...");
  for (const [sessionId, server2] of servers.entries()) {
    try {
      console.log(`Closing session: ${sessionId}`);
      await server2.close();
      const transport = transports.get(sessionId);
      if (transport) {
        await transport.close();
      }
    } catch (error) {
      console.error(`Error closing session ${sessionId}:`, error);
    }
  }
  servers.clear();
  transports.clear();
  server.close(() => {
    console.log("\u2705 Server shutdown complete");
    process.exit(0);
  });
});
