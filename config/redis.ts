import { createCluster, RedisClusterType } from "redis";

// const redisNodesString:string = process.env.REDIS_NODES || '';
let redisCluster: null | RedisClusterType | any = "null";

export default async function initRedisCluster() {
  if (process.env.IS_USE_REDIS) {
    const redisNodes = (process.env.REDIS_NODES || "").split(",").map((item) => {
      return { url: item };
    });

    console.log(redisNodes);

    const redisOptions = {
      rootNodes: redisNodes,
      password: process.env.REDIS_PASSWORD,
    };

    const redisCluster = createCluster(redisOptions);
    return await redisCluster.connect();   
    
  }
  
}