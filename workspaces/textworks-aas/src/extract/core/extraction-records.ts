/**
 * Logs and Records generated during field extraction and Url scraping
 */

export type ExtractionLog = Record<string, any>;

// Copy of the record supplied by the OpenReview team
export interface AlphaRecord {
  noteId: string;
  dblpConfId: string;
  url: string;
  title?: string;
  authorId?: string;
}

