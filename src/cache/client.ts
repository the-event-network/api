import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const client = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy: () => null,
});

let errorLogged = false;

client.on("connect", () => console.log("Connected to Redis"));
client.on("error", (err: Error) => {
  if (!errorLogged) {
    console.warn("Redis unavailable, cache disabled:", err.message);
    errorLogged = true;
  }
});

export default client;
