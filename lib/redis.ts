import "server-only";
import { Redis } from "@upstash/redis";

const url = process.env.PORTFOLIO_REDIS_KV_REST_API_URL;
const token = process.env.PORTFOLIO_REDIS_KV_REST_API_TOKEN;

if ((url || token) && !(url && token)) {
  throw new Error("The portfolio Redis connection requires both a URL and a token.");
}

export const redis = url && token ? new Redis({ url, token }) : Redis.fromEnv();
