/* global require _ $  */

let rtree = require('rbush');

export class RTreeApi {
    constructor () {
        this.rtree = rtree();
    }

    loadData(data) {
        this.rtree.load(data);
    }
}
