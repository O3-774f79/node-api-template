var express = require('express');
var bodyParser = require('body-parser');
var users = require('./routes/users');
var app = express();
app.use('/', users);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(3000, () => console.log('server run listening on port 3000'));