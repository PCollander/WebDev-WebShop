const productData = {
  products: require('../products.json').map(product => ({ ...product })),
};

const getProducts = () => {
  return [...productData.products];
};

module.exports = { getProducts };
