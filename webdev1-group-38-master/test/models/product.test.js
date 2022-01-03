const chai = require('chai');
const expect = chai.expect;

const Product = require('../../models/product');

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

// get randomized test data
const getTestData = () => {
  return {
    name: generateRandomString(),
    description: generateRandomString(),
    price: Math.random(),
    image: `http://${generateRandomString()}.${generateRandomString(3)}`,
  };
};

describe('Product Model', () => {
  describe('Schema validation', () => {
    it('must define "name"', () => {
      const data = getTestData();
      delete data.name;

      const product = new Product(data);
      const error = product.validateSync();
      expect(error).to.exist;
    });

    it('must trim spaces from "name"', () => {
      const data = getTestData();
      data.name = `  ${data.name}  `;

      const product = new Product(data);
      expect(product.name).to.equal(data.name.trim());
    });

    it('must not allow "name" to have only spaces', () => {
      const data = getTestData();
      data.name = '     ';

      const product = new Product(data);
      const error = product.validateSync();
      expect(error).to.exist;
    });

    it('must require "name" to be at least one character long', () => {
      const data = getTestData();
      data.name = '';

      const product = new Product(data);
      const error = product.validateSync();
      expect(error).to.exist;
    });

    it('must not allow "name" to be longer than 50 characters', () => {
      const data = getTestData();
      data.name = createTestString(51);

      const product = new Product(data);
      const error = product.validateSync();
      expect(error).to.exist;
    });

    it('must define "price"', () => {
      const data = getTestData();
      delete data.price;

      const product = new Product(data);
      const error = product.validateSync();
      expect(error).to.exist;
    });

    it('must require "price" to be at least zero', () => {
      const data = getTestData();
      data.price = -1;

      const product = new Product(data);
      const error = product.validateSync();
      expect(error).to.exist;
    });

    it('has an optional "description"', () => {
      const data = getTestData();
      delete data.description;

      const product = new Product(data);
      const error = product.validateSync();
      expect(error).to.be.undefined;
    });

    it('must trim "description"', () => {
      const data = getTestData();
      data.description = `  ${data.description}  `;

      const product = new Product(data);
      expect(product.description).to.equal(data.description.trim());
    });

    it('has an optional "image"', () => {
      const data = getTestData();
      delete data.image;

      const product = new Product(data);
      const error = product.validateSync();
      expect(error).to.be.undefined;
    });

    it('must check "image" format is url', () => {
      const data = getTestData();
      data.image = data.image.replace('.', '');

      const product = new Product(data);
      expect(product.image).to.equal(data.image.trim());
    });

    it('must check "image" format is url with protocol', () => {
      const data = getTestData();
      data.image = data.image.replace('http://', '');

      const product = new Product(data);
      expect(product.image).to.equal(data.image.trim());
    });

    it('must trim "image"', () => {
      const data = getTestData();
      data.image = `  ${data.image}  `;

      const product = new Product(data);
      expect(product.image).to.equal(data.image.trim());
    });

    it('must cast "image" to lowercase', () => {
      const data = getTestData();
      data.image = data.image.toUpperCase();

      const product = new Product(data);
      expect(product.image).to.equal(data.image.toLowerCase());
    });
  });
});
