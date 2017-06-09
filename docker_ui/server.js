const bodyparser = require('body-parser');
const express = require('express');

var router = express();

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({
    extended: true
}));

// Website.
router.use(express.static(__dirname + '/public'));
router.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// API route.
var api = require('./routes/api');
router.use('/api', api);

router.listen(3000, function() {
    console.log('Server listening on port 3000');
});
