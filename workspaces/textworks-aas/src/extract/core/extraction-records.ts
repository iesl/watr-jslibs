
/**
 * Logs and Records generated during field extraction and Url scraping
 */

export type ExtractionLog = Record<string, any>;

// TODO: save this record when processing html cache during extraction
// Copy of the record supplied by the OpenReview team
export interface AlphaRecord {
  noteId: string;
  dblpConfId: string;
  title?: string;
  authorId?: string;
  url: string;
}

