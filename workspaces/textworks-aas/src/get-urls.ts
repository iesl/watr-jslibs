import axios from "axios";
import fs from 'fs-extra';

export async function getHtml(url: string, output: string): Promise<void> {
  return axios({
    method: 'get',
    url,
    responseType: 'stream'
  }).then((response) => {
    return response.data.pipe(fs.createWriteStream(output))
  });
}
