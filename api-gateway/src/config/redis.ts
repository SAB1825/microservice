import Redis from "ioredis";
import { config } from ".";
import logger from "./logger";
import { error } from "console";

class RedisClient {
  private static instance: Redis;
  private static isConnected = false;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(config.REDIS_URL, {
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      RedisClient.setupEventListeners();
    }

    return RedisClient.instance;
  }

  private static setupEventListeners(): void {
    RedisClient.instance.on("connect", () => {
      RedisClient.isConnected = true;
      logger.info("Connected to Redis");
    });
    RedisClient.instance.on("error", () => {
      RedisClient.isConnected = false;
      logger.info("Redis Connection Error :", error);
    });
    RedisClient.instance.on("close", () => {
      RedisClient.isConnected = false;
      logger.info("Redis Connection Closed");
    });
    RedisClient.instance.on("reconnecting", () => {
      RedisClient.isConnected = false;
      logger.info("Reconnecting to Redis Server");
    });
  }

  public static isReady(): boolean {
    return RedisClient.isConnected;
  }
}

export default RedisClient.getInstance();
