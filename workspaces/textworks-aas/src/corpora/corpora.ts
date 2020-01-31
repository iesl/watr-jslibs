//
export interface CorpusArtifact {
  corpusEntry: CorpusEntry;
  artifactType: string;
  path: string;
}

export interface CorpusEntry {
  entryId: string;
  path: string;
}
