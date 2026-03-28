import client from "./client";

export async function getOrSet<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached) as T;

  const result = await fn();
  await client.setex(key, ttlSeconds, JSON.stringify(result));
  return result;
}

export async function del(key: string): Promise<void> {
  await client.del(key);
}

export async function delPattern(pattern: string): Promise<void> {
  const keys: string[] = [];
  let cursor = "0";

  do {
    const [nextCursor, found] = await client.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100,
    );
    cursor = nextCursor;
    keys.push(...found);
  } while (cursor !== "0");

  if (keys.length > 0) await client.del(...keys);
}
