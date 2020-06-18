//
import fs from "fs-extra";
import path from "path";
import { promisify } from 'bluebird';

const readFileAsync = promisify<Buffer, string>(fs.readFile)

export async function readResolveFileAsync(leading: string, ...more: string[]): Promise<string | undefined> {
  const filepath = path.join(leading, ...more);

  const exists = fs.existsSync(filepath);

  if (exists) {
    return readFileAsync(filepath)
      .then(content => content.toString());
  }
  return undefined;
}

export function readResolveFile(leading: string, ...more: string[]): string | undefined {
  const filepath = path.join(leading, ...more);
  const exists = fs.existsSync(filepath);
  if (exists) {
    const buf = fs.readFileSync(filepath);
    const fileContent = buf.toString().trim();
    return fileContent;
  }
  return undefined;
}

export async function withCachedFile(
  cacheDirectory: string,
  cacheFilename: string,
  fn: () => Promise<string>
): Promise<string> {

  const maybeCached = await readResolveFileAsync(cacheDirectory, cacheFilename);
  if (maybeCached) {
    return maybeCached;
  }

  const content = await fn();

  const cachedPath = path.join(cacheDirectory, cacheFilename);
  await fs.writeFile(cachedPath, content, {});
  return content;
}
