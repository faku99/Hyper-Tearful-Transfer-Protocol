const datamuse = require('datamuse');

var word = pickOneWordByLetter("H");



function getHTTPAcronym() {

    HTTPAcronym = {
        "H" : pickOneWordByLetter("h")
    }

}


function pickOneWordByLetter(letter) {

    datamuse.words({
        sp: letter + "*",
        max: 1000
    })
        .then(function (json) {
            arrayLetter = json;
            console.log(randomEntry(arrayLetter).word);
            return randomEntry(arrayLetter).word;
        });

}

function randomEntry(array) {
    return array[Math.floor(Math.random() * array.length)];
}