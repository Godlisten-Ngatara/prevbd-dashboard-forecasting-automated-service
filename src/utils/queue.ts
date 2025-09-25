import { Queue } from "bullmq";
import redisConn from "../config/redisConn.js";

const forecastQueue = new Queue("forecastQueue", {
  connection: redisConn,
});

export default forecastQueue;