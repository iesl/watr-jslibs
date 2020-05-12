import { SpideringEnv } from './spidering';

import {  WebDriver, By, until } from 'selenium-webdriver';

export interface SpideringRule {
  urlre: RegExp;
  rule: (env: SpideringEnv, wd: WebDriver, url: string) => Promise<string|undefined>;
}

// Rules:
export const SpideringRules: SpideringRule[] = [
  { urlre: new RegExp('aaai.org.+/paper/view/.*'),
    rule: async (env, wd: WebDriver, url: string) => {
      // re-write the url
      const newUrl = url.replace('/view/', '/viewPaper/');
      waitForDocReady(env, wd, newUrl);
      await wd.wait(until.elementLocated(By.id('abstract')), 5000);
      const pageSource = await wd.getPageSource();
      return pageSource;
    }},
  { urlre: new RegExp('arxiv.org'),
    rule: async (env, wd: WebDriver, url: string) => {
      // re-write the url
      const newUrl = url.replace('/arxiv.org/', '/export.arxiv.org/');
      waitForDocReady(env, wd, newUrl);
      await wd.wait(until.elementLocated(By.id('abstract')), 5000);
      const pageSource = await wd.getPageSource();
      return pageSource;
    }},
  { urlre: new RegExp('//doi.org/.*'),
    rule: async (env, wd: WebDriver, url: string) => {

      await waitForDocReady(env, wd, url);
      const pageSource = await wd.getPageSource();

      return pageSource;
    }},
  { urlre: new RegExp('.*'),
    rule: async (env, wd: WebDriver, url: string) => {
      await waitForDocReady(env, wd, url);
      return wd.getPageSource();
    }}
];


async function waitForDocReady(env: SpideringEnv, wd: WebDriver, url: string): Promise<void> {
  const { logger } = env;
  await wd.get(url)
  await wd.sleep(2000)
  const readyState: string = await wd.executeScript('return document.readyState');
  const currUrl = await wd.getCurrentUrl();
  logger.info({ event: 'document.ready', readyState, url, finalUrl: currUrl  });
}
