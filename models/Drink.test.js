const Drink = require('./Drink');
const db = require('../db');
let d1;
let d2;
let d3;

const testDrink1Data = {
    name: "Neer Beer",
    maker: "Faux Ales, Inc"
};

const testDrink2Data = {
    name: "O'douls",
    maker: "Anheuser Busch",
    abv: "0.5%",
    untappd_id: "34567"
}

beforeAll(async () => {
    d1 = await Drink.create(testDrink1Data);
    d2 = await Drink.create(testDrink2Data);
});

describe('Drink.create method', () => {
    test('it should create and return drink data', async () => {
        const d3data = {
            name: "ZBeer 3",
            maker: "test brewing company"
        }
        d3 = await Drink.create(d3data);
        expect(d3.name).toEqual(d3data.name);
        expect(d3.maker).toEqual(d3data.maker);
        expect(d3.abv).toEqual(null);
        expect(d3.untappd_id).toEqual(null);
        expect(d3.created_at).toEqual(expect.any(Date));
        expect(d3.updated_at).toEqual(expect.any(Date));
    })
});

describe('Drink.get method', () => {
    test('it should return a list of all drinks', async () => {
        const drinks = await Drink.get();
        expect(drinks).toEqual([d1, d2, d3])
        expect(1).toBe(1);
    });
});

describe('Drink.getById method', () => {
    test('it should return a drink', async () => {
        const drink = await Drink.getById(d1.id);
        expect(drink).toEqual(d1);
    })
});

describe('Drink.update method', () => {
    test('it should update a drink and return data', async () => {
        const updated = await Drink.update(d3.id, {name: "updatedName", maker: "Big Box Brewing", untappd_id: "444"});
        expect(updated.name).toEqual("updatedName");
        expect(updated.untappd_id).toEqual("444");
    });
});

describe('Drink.delete method', () => {
    test('it should delete a drink from the database', async () => {
        await Drink.delete(d1.id);
        await expect(() => Drink.getById(d1.id)).rejects.toThrow(expect.any(Error));
    })
});


afterAll(async () => {
    await db.query('DELETE FROM drinks');
    await db.end();
});