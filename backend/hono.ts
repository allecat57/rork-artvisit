import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { createWSContext } from "hono/ws";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// WebSocket endpoint
app.get(
  "/ws",
  createWSContext((c) => {
    return {
      onOpen(event, ws) {
        console.log("WebSocket connection opened");
        ws.send(JSON.stringify({ 
          type: "connection", 
          message: "Connected to WebSocket server",
          timestamp: new Date().toISOString()
        }));
      },
      onMessage(event, ws) {
        console.log("Received message:", event.data);
        
        try {
          const data = JSON.parse(event.data.toString());
          
          // Echo the message back with timestamp
          ws.send(JSON.stringify({
            type: "echo",
            originalMessage: data,
            timestamp: new Date().toISOString(),
            message: `Server received: ${data.message || "No message"}`
          }));
        } catch (error) {
          ws.send(JSON.stringify({
            type: "error",
            message: "Invalid JSON format",
            timestamp: new Date().toISOString()
          }));
        }
      },
      onClose: () => {
        console.log("WebSocket connection closed");
      },
      onError(event, ws) {
        console.error("WebSocket error:", event);
      },
    };
  })
);

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "API is running",
    timestamp: new Date().toISOString(),
    websocket: "Available at /api/ws"
  });
});

// Add a test endpoint
app.get("/test", (c) => {
  return c.json({ 
    message: "Backend is working correctly",
    timestamp: new Date().toISOString()
  });
});

export default app;