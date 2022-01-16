require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { ExpressError } = require('./expressError');
const { authenticateJWT  } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(authenticateJWT);
app.use(morgan('dev'));

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    return res.json({foo: 'bar'});
})

app.use((req, res, next) => {
    const error = new ExpressError('Resource not Found', 404);
    next(error);
});

app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || "Server Error";
    return res.status(status).send({message});
});

module.exports = app;