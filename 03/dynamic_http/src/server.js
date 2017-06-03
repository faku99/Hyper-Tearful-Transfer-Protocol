const async = require('async');
const datamuse = require('datamuse');
const express = require("express");

var app = express();

app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get("/api/random", function(req, res) {
    async.parallel([
        function(callback) {
            pickOneWordByLetter('h').then(function(result) {
                callback(null, result);
            });
        },
        function(callback) {
            pickOneWordByLetter('t').then(function(result) {
                callback(null, result);
            });
        },
        function(callback) {
            pickOneWordByLetter('t').then(function(result) {
                callback(null, result);
            });
        },
        function(callback) {
            pickOneWordByLetter('p').then(function(result) {
                callback(null, result);
            });
        }
    ], function(err, results) {
        if (err) {
            throw new Error(err);
        }

        res.status(200).json(results);
    });
});

function pickOneWordByLetter(letter) {
    return new Promise(function(resolve, reject) {
        datamuse.words({
            sp: letter + "*",
            max: 1000
        }).then(
            function(result) {
                var word = randomEntry(result).word;
                // Capitalize first letter.
                word = word.charAt(0).toUpperCase() + word.slice(1);

                resolve(word);
            }, function(err) {
                reject(err);
        });
    });
}

function randomEntry(array) {
    return array[Math.floor(Math.random() * array.length)];
}

app.listen(3000);
