
/* global require beforeEach afterEach fixture expect describe it */

let gp = require('./../src/client/graphpaper.js');

describe('GraphPaper', function() {

    beforeEach(function() {
        fixture.base = 'test';
        fixture.cleanup();
        let fixtures = fixture.load('graphpaper.test.html');
        // let htmlSnippet = fixtures[0];
        // console.log('html', htmlSnippet);
    });

    it('hello world', function() {
        let drawingApi = new gp.DrawingApi('gp-canvas');
        drawingApi.drawChar({x: 10, y: 10}, 'z');
        drawingApi.drawBox({x: 20, y: 20}, 'z');

    });
});
