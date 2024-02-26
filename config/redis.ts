import { createCluster, RedisClusterType } from "redis";

// const redisNodesString:string = process.env.REDIS_NODES || '';
let redisCluster: null | RedisClusterType = null;
console.log('IS_USE_REDIS', typeof process.env.IS_USE_REDIS );

if (process.env.IS_USE_REDIS) {
  const redisNodes = (process.env.REDIS_NODES || "").split(",").map((item) => {
    return { url: item };
  });

  console.log(redisNodes);
  
  const redisOptions = {
    rootNodes: redisNodes,
    defaults: {
      password: process.env.REDIS_PASSWORD,
    },
    slotsRefreshTimeout: 2000,
    redisOptions: {
      connectTimeout: 15000, // 15 seconds
    },
  };

  const redisCluster = createCluster(redisOptions);
  redisCluster?.connect();
}
export default redisCluster;
