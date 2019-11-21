const express = require('express');
const bodyParser = require('body-parser');
const supplieror = require('./controllers/ResourceConfig')
const ServiceFlow = require('./asset/db.json')
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/v1/ResourceConfigMagellan/' + ServiceFlow.serviceFlow, supplieror.checkSupplierorder)

app.listen(50000, () => console.log('server run listening on port 50000'));