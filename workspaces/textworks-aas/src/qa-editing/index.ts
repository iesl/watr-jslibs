//

import _ from "lodash";
import path from "path";

/**
 * Manage procedural checklists for obtaining some resource,
 * e.g., a pdf, a downloaded html, an extracted field (title, authors, abstract)
 *
 */

/*
 * - Data gathering
 *   - for each corpus entry directory
 *     - collect every available abstract
 *     - With the abstracts
 *       - apply data cleaning procedures
 *       - compare all, delete duplicates
 *     - Put remaining unique fields into file bundle.json
 *        - { fields : [
 *                      { name: "abstract", evidence: "..", value: "Abstract The ..." },
 *                      { name: "abstract", evidence: "..", value: "The ..." }
 *                      { name: "abstract", evidence: "..", value: "The ...", qa-tags: 'found', artifact: 'download-1.html' }
 *                      { name: "abstract", artifact: 'download-2.html', qa-tags: 'not-found' }
 *                      { name: "abstract", artifact: 'some-paper.pdf', qa-tags: 'part-found' }
 *                      { name: "abstract", artifact: 'download3.html', qa-tags: 'found' }
 *            ],
 *            artifacts: [
 *               { field: "abstract", artifact: 'download.html', qa-tags: 'available', url: '' }
 *               { field: "abstract", artifact: 'some-paper.pdf', qa-tags: 'not-available', url: '' }
 *            ],
 *            urls   : [
 *               { field: "abstract", url: 'http://x.y.blah/', qa-tags: 'not-available' }
 *               { field: "title", url: 'http://x.y.blah/', qa-tags: 'available:html,available:pdf' }
 *            ],
 *
 *    field-qa-tags = (not-)found, (not-)clean, partial
 *    artifact-qa-tags = (not-)available,
 *    url-qa-tags = (not-)available,   {  name: "abstract", }
 *
 * - QA/Reconciliation process:
 *   - With each bundle.json
 *     - display 1st available abstract, plus alt-count
 *     - user option: cycle through alts
 *     - user option: mark current field (1st or alt) as qa-edit: "ok|needs-cleaning|wrong"
 *   - On subsequent QAs, don't redisplay entries with user-verified qaedit='ok' fields
 *
 * - Improving html extraction
 *   - With each entry that has bundle.json without a qaedit == 'ok'
 *     - user-option: copy to local test dir to improve extraction/cleaning
 *
 * - Improving spidering
 *
 * - Bundling process:
 *   - concat all bundles.json
 *   - e.g., find corpus.d -type f -name 'bundle.json' -exec cat {} ';' | jq '[ .fields ]' > mega-bundle.json
 */

// const Sample = {
//   name: "header-field",
// };

// const QAEditStates = [
//   "spider.downloads.htmls: 3",
//   "spider.downloads.pdfs: 1",
//   "extractor.fields.abstracts: 1",
//   "extractor.fields.abstract.qa: ",
//   "spider.downloads.pdfs: 1",
//   "spider.downloads.pdfs: 1",
// ];
