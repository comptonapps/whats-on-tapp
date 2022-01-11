const express = require('express');
const morgan = require('morgan');
const db = require('./db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

app.get('/', (req, res) => {
    return res.json({foo: 'bar'});
})

module.exports = app;