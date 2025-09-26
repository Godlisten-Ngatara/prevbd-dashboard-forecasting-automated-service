import { Redis } from "ioredis";

const HOST = process.env.HOST || "127.0.0.1"
const redisConn = new Redis({
  host: HOST,
  maxRetriesPerRequest: null,
});

export default redisConn