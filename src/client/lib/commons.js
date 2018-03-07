/* global require location */

/**
 * @returns {string}
 */
export function corpusEntry() {
    let entry = location.href.split('/').reverse()[0].split('?')[0];
    return entry;
}

export function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[[]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


export function IdGenerator() {
    let currId = -1;
    let nextId = () => {
        currId +=1;
        return currId;
    };
    return nextId;
}

