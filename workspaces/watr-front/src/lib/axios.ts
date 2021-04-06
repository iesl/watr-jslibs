import path from 'path'

import axios, {
  AxiosRequestConfig,
  AxiosInstance
} from 'axios'

export function configRequest(): AxiosRequestConfig {
  const auth = {}

  const config: AxiosRequestConfig = {
    baseURL: 'http://localhost:3100/',
    headers: {
      ...auth
    },
    timeout: 4000
    // responseType: "json"
  }

  return config
}

export function configAxios(): AxiosInstance {
  const conf = configRequest()
  return axios.create(conf)
}

export function resolveCorpusUrl(entryId: string, ...artifactPaths: string[]): string {
  const fullPath = resolveCorpusPath(entryId, ...artifactPaths)
  const base = 'http://localhost:3100/'
  return base + fullPath
}

export function resolveCorpusPath(entryId: string, ...artifactPaths: string[]): string {
  const leaves = path.join(entryId, ...artifactPaths)
  const full = path.join('/api/corpus/entry/', leaves)
  return full
}

export async function getArtifactData<T>(entryId: string, ...artifactPaths: string[]): Promise<T | undefined> {
  return configAxios()
    .get(resolveCorpusPath(entryId, ...artifactPaths))
    .then(resp => resp.data)
}
