import Redis from "ioredis";
import { saveCosmos } from "./Utils";

const host = process.env.APP_REDIS_HOST;
const port = Number(process.env.APP_REDIS_PORT) || 6379;
const db = 0;

let redis: Redis | null = null;
let redisSubscriber: Redis | null = null;
let initialized = false;

export function getRedis(): Redis {
    if (!redis) {
        redis = new Redis({ host, port, db });
    }
    return redis;
}

export function getRedisSubscriber(): Redis {
    if (!redisSubscriber) {
        redisSubscriber = new Redis({ host, port, db, retryStrategy: times => Math.min(times * 100, 3000) });
    }
    return redisSubscriber;
}

export async function initRedis(): Promise<void> {
    if (initialized) return;

    try {
        const redisClient = getRedis();
        const subscriber = getRedisSubscriber();
        redisClient.on("error", (err) => { console.error("❌ Redis error:", err); });
        subscriber.on("error", (err) => { console.error("❌ Redis subscriber error:", err); });

        // Enable expiration events (once)
        await redisClient.config("SET", "notify-keyspace-events", "Ex");

        const expiredChannel = `__keyevent@${db}__:expired`;

        await subscriber.subscribe(expiredChannel);

        subscriber.on("message", async (_, message) => {
            try {
                if (message.startsWith("reminder:")) {
                    const sessionId = message.split(':')[1]
                    const jsonData = await redisClient.get(sessionId);
                    await handleReminderExpired(sessionId, jsonData);
                }
            } catch (handlerError) {
                console.error("❌ Expiration handler error:", handlerError);
            }
        });

        initialized = true;
        console.log("✅ Redis initialized successfully");

    } catch (error) {
        console.error("❌ Redis initialization failed:", error);
        initialized = false;
        throw error; // Fail fast — Azure will retry
    }
}

async function handleReminderExpired(key: string, data?: any): Promise<void> {
    try {
        console.log("⏰ Session pre-expired (~1 min left) saved container Cosmos key:", key);
        await saveCosmos(data);

        // 🔥 business logic here
    } catch (error) {
        console.error("❌ handleReminderExpired failed:", error);
    }
}

export { redis, redisSubscriber };