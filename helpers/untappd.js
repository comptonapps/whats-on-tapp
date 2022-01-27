require('dotenv').config();
const axios = require('axios');
const client_id = process.env.UNTAPPD_CLIENT_ID;
const client_secret = process.env.UNTAPPD_CLIENT_SECRET;

async function getData(filters) {
    const { offset=0, q, limit=25, sort='checkin' } = filters;
    const params = {client_secret, client_id, offset, q, limit, sort }
    const queryParams = Object.keys(params).map(k => `&${k}=${params[k]}`).join("");
    const res = await axios.get(`http://api.untappd.com/v4/search/beer?${queryParams}`);
    if (res.data.response.found > 0) {
        return destructureUntappdResults(res.data.response.beers.items);
    }
    return [];
}

function destructureUntappdResults(items) {
    return items.map(i => {
        return {
            name: i.beer.beer_name, 
            maker: i.brewery.brewery_name, 
            abv: i.beer.beer_abv, 
            description: i.beer.beer_description, 
            untappd_id: i.beer.bid
        };
    });
}

module.exports = getData;