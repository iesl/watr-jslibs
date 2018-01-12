
/* global require beforeEach _ fixture describe it watr */


describe('Grid-based drag/drop reordering', function() {


    beforeEach(function() {
        fixture.base = 'test';
        fixture.cleanup();
        fixture.load('dragsort.test.html');
        // let htmlSnippet = fixtures[0];
        // console.log('html', htmlSnippet);
    });



    it('should render', function() {
        let DR = require('./../src/client/lib/dragsort.js');
        _.map(_.range(0, 5), i => {

        });
        // d3.select('svg')

        DR.reorder()
            .then(res => {
                console.log('change in order', res);

            })
            .catch(() => {
                console.log('no change in order');

            })
        ;
    });
});
