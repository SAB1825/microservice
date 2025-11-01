import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import logger from "./config/logger";
import { config } from "./config";
import { limiter } from "./middlewares/rate-limit.middleware";
import { proxyServices } from "./config/services";

const app = express();

app.use(helmet());
app.use(cors());
app.use(limiter)

//REQUEST LOGGING MIDDLEWARE
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.url}`);
  next;
});

//HEALTH CHECK
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

//SERVICE ROUTES
proxyServices(app)

//404 HANDLER
app.use((req: Request, res: Response) => {
  logger.debug(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.status(404).json({
    message: "Resource not found",
  });
});

//ERROR HANDLING MIDDLEWARE
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Unhandled Erorr : ", err);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

//START SERVER FUNCTION
async function startServer() {
    try {
        app.listen(config.PORT, () => {
            logger.info(`${config.SERVICE_NAME} running on PORT ${config.PORT}`)
        })
    } catch (error) {
        logger.error('Failed to start Server: ', error);
        process.exit(1)
    }
}

startServer();