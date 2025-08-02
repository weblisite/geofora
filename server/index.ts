import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { checkDatabaseConnection, initDatabase } from "./database";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// Middleware to capture raw request body for webhook verification
const rawBodySaver = (req: Request, res: Response, buf: Buffer, encoding: string) => {
  if (buf && buf.length) {
    (req as any).rawBody = buf.toString(encoding || 'utf8');
  }
};

// Use JSON parser with rawBody option for webhook endpoints
app.use('/api/webhooks/polar', express.json({
  verify: rawBodySaver,
  limit: '1mb'
}));

// Regular JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize the database
  try {
    // Check if database connection is working
    const isConnected = await checkDatabaseConnection();
    
    if (isConnected) {
      log('Successfully connected to PostgreSQL database');
      // Initialize database (create tables if needed)
      await initDatabase();
      log('Database initialized successfully');
    } else {
      log('Error connecting to PostgreSQL database - using fallback storage');
    }
  } catch (error: any) {
    log(`Database error: ${error.message}`);
  }
  
  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Add 404 handler for unknown routes (AFTER static serving)
  app.use(notFoundHandler);
  
  // Add comprehensive error handler
  app.use(errorHandler);

  // Production-ready server configuration
  const port = process.env.PORT || 4000;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
  
  server.listen({
    port: parseInt(port.toString()),
    host,
  }, () => {
    log(`🚀 Server running on ${host}:${port} in ${process.env.NODE_ENV || 'development'} mode`);
    if (process.env.NODE_ENV === 'production') {
      log(`🌍 Health check available at: http://${host}:${port}/api/health`);
    }
  });
})();
