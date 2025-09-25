import { Redis } from "ioredis";

const redisConn = new Redis({
  host: "localhost",
  maxRetriesPerRequest: null,
});

export default redisConn