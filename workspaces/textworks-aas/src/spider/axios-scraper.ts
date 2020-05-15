import axios, { AxiosResponse } from "axios";
import stream from 'stream';
import { SpideringEnv } from '~/spider/spidering';
import { prettyPrint } from 'commons/dist';

export async function fetchUrl(_env: SpideringEnv, url: string): Promise<string> {
  const userAgents = [
    'Mozilla/5.0 (X11; Linux x86_64; rv:73.0) Gecko/20100101 Firefox/73.0',
    'Wget/1.17.1 (linux-gnu)'
  ];
  return axios({
    method: 'get',
    url,
    responseType: 'stream',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'Keep-Alive',
      'Accept-Encoding': 'identity',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'User-Agent': userAgents[0],
      'Upgrade-Insecure-Requests': '1',
    }
  }).then((response: AxiosResponse<any>) => {
    return new Promise((resolve) => {
      const buf: string[] = [];
      const { data, headers } = response;
      const contentType: string = headers['content-type'];

      if (contentType.includes('text/html')) {
        return resolve(data);
      }

      // Assume stream response
      data.on('end', () => {
        resolve(buf.join());
      })
      data.on('close', () => undefined)
      data.on('data', (d: string) => {
        buf.push(d);
      });
    })
  });
}
