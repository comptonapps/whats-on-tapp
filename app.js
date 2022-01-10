require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    return res.json({foo: 'bar'});
})

module.exports = app;