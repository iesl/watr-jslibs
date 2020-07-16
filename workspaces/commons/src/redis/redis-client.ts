import redis, { RedisClient } from "redis";
import { promisify } from 'util';

export async function getRedisClient(): Promise<RedisClient> {
  return new Promise<RedisClient>((resolve) => {
    const client = redis.createClient();
    client.on("error", (error: any) => {
      console.log("Redis Error", error);
    });
    client.on("ready", () => {
      resolve(client);
    });
  });
}


export interface AsyncRedisClient {
  client: RedisClient;
  get: (s: string) => Promise<string | null>;
  set: (k: string, v: string) => Promise<'OK'>;
  subscribe: (topic: string) => Promise<string>;
  unsubscribe: (topic: string) => Promise<string>;
  psubscribe: (topic: string) => Promise<string>;
  punsubscribe: (topic: string) => Promise<string>;
  publish: (channel: string, msg: string) => Promise<number>;
  quit: () => Promise<'OK'>;
}


export async function getAsyncRedisClient(): Promise<AsyncRedisClient> {
  return getRedisClient()
    .then(client => {
      return {
        client,
        get: promisify<string, string | null>(client.get).bind(client),
        set: promisify<string, string, 'OK'>(client.set).bind(client),
        subscribe: promisify<string, string>(client.subscribe).bind(client),
        unsubscribe: promisify<string, string>(client.unsubscribe).bind(client),
        psubscribe: promisify<string, string>(client.psubscribe).bind(client),
        punsubscribe: promisify<string, string>(client.punsubscribe).bind(client),
        publish: promisify<string, string, number>(client.publish).bind(client),
        quit: promisify<'OK'>(client.quit).bind(client),
      }
    });
}
