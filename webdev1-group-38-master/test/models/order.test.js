const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');

const Order = require('../../models/order');

// helper function for creating randomized test data
const generateRandomString = (len = 9) => {
  let str = '';

  do {
    str += Math.random().toString(36).substr(2, 9).trim();
  } while (str.length < len);

  return str.substr(0, len);
};

const createTestString = (strLength = 9, character = 'a') => {
  return new Array(strLength + 1).join(character);
};

const getTestItem = () => {
  return {
    product: {
      name: generateRandomString(),
      description: generateRandomString(),
      image: `http://${generateRandomString()}.${generateRandomString(3)}`,
    },
    quantity: Math.round(Math.random() * 10 + 1),
  };
};

// get randomized test data
const getTestData = (numItems = 0) => {
  return {
    customerId: mongoose.Types.ObjectId(generateRandomString(12)),
    items: Array(numItems)
      .fill()
      .map(() => getTestItem()),
  };
};

describe('Order Model', () => {
  describe('Schema validation', () => {
    it('must define "customerId"', () => {
      const data = getTestData();
      delete data.customerId;

      const order = new Order(data);
      const error = order.validateSync();
      expect(error).to.exist;
    });
  });
});
