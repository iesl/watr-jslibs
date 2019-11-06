

export interface ServerAPI {
  getCorpusListing(start: number, len: number): any[];
}

// export function getCorpusListing(start, len) {
//   return new Promise((resolve, reject) => {
//     let url = `/api/v1/corpus/entries?start=${start}&len=${len}`;
//     $.getJSON(url, (response) => resolve(response))
//       .fail((xhr, status, err) => reject("Server Error:" + status + err.message));
//   });
// }
