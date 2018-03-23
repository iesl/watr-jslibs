let getIntById = function(id) {
    return parseInt(document.getElementById(id).value, 10);
};

let calculate = function() {
    var sum = getIntById('x') + getIntById('y');
    document.getElementById('result').innerHTML = isNaN(sum) ? 0 : sum;
};

export let initCalc = function() {
    document.getElementById('add').addEventListener('click', calculate);
};