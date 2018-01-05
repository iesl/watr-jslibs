/**
 * This is just a hello-world module to get the test harness working properly.
 */

/* global require beforeEach afterEach fixture expect describe it */

let calc = require('./../src/client/attic/calc.js');


describe('Calculator', function() {

    it('should add numbers');

    beforeEach(function() {
        fixture.base = 'test';
        fixture.cleanup();
        let fixtures = fixture.load('calc.test.html');
        // let htmlSnippet = fixtures[0];
        // console.log('html', htmlSnippet);
    });

    afterEach(function() {
    });

    // call the init function of calculator to register DOM elements
    beforeEach(function() {
        calc.initCalc();
    });

    it('should return 3 for 1 + 2', function() {

        document.getElementById('x').value = 1;
        document.getElementById('y').value = 2;
        document.getElementById('add').click();
        expect(document.getElementById('result').innerHTML).toBe('3');
    });

    it('should calculate zero for invalid x value', function() {
        document.getElementById('x').value = 'hello';
        document.getElementById('y').value = 2;
        document.getElementById('add').click();
        expect(document.getElementById('result').innerHTML).toBe('0');
    });

    it('should calculate zero for invalid y value', function() {
        document.getElementById('x').value = 1;
        document.getElementById('y').value = 'goodbye';
        document.getElementById('add').click();
        expect(document.getElementById('result').innerHTML).toBe('0');
    });
});


