

import $ from 'jquery';


export function asyncGetJson<T>(url: string): Promise<T> {
  return new Promise( (resolve: ((t:T) => void), reject: ((s:string) => void)) => {
    $.getJSON(url, (response: any) => {
      return resolve(response)
    }).fail((xhr, status, err) => reject(`Server Error (${status}): ${err}, ${xhr.toString()}`));
  });
}


