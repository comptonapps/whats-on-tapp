const app = require('./app');
const CONSTANTS = require('./constants');

const PORT = CONSTANTS.SERVER_PORT || 3003;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});