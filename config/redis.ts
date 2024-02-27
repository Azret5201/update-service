import { createCluster, RedisClusterType } from "redis";

// const redisNodesString:string = process.env.REDIS_NODES || '';
let redisCluster: null | RedisClusterType = null;

export default async function initRedisCluster() {
  if (process.env.IS_USE_REDIS) {
    const redisNodes = (process.env.REDIS_NODES || "").split(",").map((item) => {
      return { url: item };
    });

    const redisOptions = {
      rootNodes: redisNodes,
      defaults: {
        password: process.env.REDIS_PASSWORD,
      }
    };

    const redisCluster = createCluster(redisOptions);
    await redisCluster.connect();   
    return redisCluster;
  }
  
}