import axios from "axios";
import fs from 'fs-extra';

// curl -L -ivs -H "Connection: Keep-Alive" -H "Accept-Encoding: identity" -H "User-Agent: Wget/1.17.1 (linux-gnu)"  https://aaai.org/ocs/index.php/WS/AAAIW18/paper/viewPaper/16162
export async function getHtml(url: string, output: string): Promise<void> {
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
  }).then((response) => {
    return response.data.pipe(fs.createWriteStream(output))
  });
}

// const hdrs = {
//   'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//   'Accept-Encoding': 'gzip, deflate, br',
//   'Accept-Language': 'en-US,en;q=0.5',
//   'Cache-Control': 'no-cache',
//   'Connection': 'keep-alive',
//   'Cookie': '..',
//   'DNT': '1',
//   'Host': 'aaai.org',
//   'Pragma': 'no-cache',
//   'Upgrade-Insecure-Requests': '1',
//   'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:73.0) Gecko/20100101 Firefox/73.0',
// };
