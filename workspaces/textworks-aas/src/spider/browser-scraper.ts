
import { Builder, WebDriver } from 'selenium-webdriver';
import { SpideringEnv } from './spidering';
import { SpideringRules, SpideringRule } from './scraping-rules';

export type FetchUrlFn = (env: SpideringEnv, url: string) => Promise<string|undefined>;
export type ShutdownFn = () => Promise<void>;

export async function initBrowser(): Promise<WebDriver> {
  const bldr = new Builder();
  bldr.forBrowser('firefox');
  bldr.getCapabilities().setAcceptInsecureCerts(true);
  return bldr.build();
}

export async function fetchViaFirefox(): Promise<[FetchUrlFn, ShutdownFn]> {
  const driver0 = await initBrowser();

  const fetch: FetchUrlFn = async (env, url) => {
    const driver = driver0;
    return getPageHtml(env, driver, url);
  };

  const shutdown: ShutdownFn = async () => {
    const driver = driver0;
    return driver.quit();
  }
  return [fetch, shutdown];
}



export async function getPageHtml(env: SpideringEnv, driver: WebDriver, url: string): Promise<string|undefined> {
  const { logger } = env;

  const applicableRules = SpideringRules.filter(r => r.urlre.test(url));

  if (applicableRules.length === 0) {
    throw Error('no no applicable spidering rules for ${url}');
  }

  let rule: SpideringRule = applicableRules[0];

  logger.info({
    event: `use rule: match ${rule.urlre.source}`,
    url,
  });
  return rule.rule(env, driver, url)
    .catch(err => {
      logger.info({
        event: 'get url exception',
        msg: err,
        url,
      });
      return undefined;
    });
}
