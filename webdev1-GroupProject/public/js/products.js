const productsContainer = document.getElementById('products-container');
const productTemplate = document.querySelector('#product-template');

/**
 * 
 * Presents all the products for the user
 * 
 * */

const showProducts = async () => {
  const resourceURI = '/api/products';
  const jsonData = await getJSON(resourceURI);

  return await jsonData.forEach(product => {
    const tClone = productTemplate.content.cloneNode(true);

    const row = tClone.querySelector('.item-row');
    row.id = `product-${product._id}`;

    const name = tClone.querySelector('.product-name');
    name.innerHTML = product.name;
    name.id = `name-${product._id}`;

    const description = tClone.querySelector('.product-description');
    description.innerHTML = product.description;
    description.id = `description-${product._id}`;

    const price = tClone.querySelector('.product-price');
    price.innerHTML = product.price;
    price.id = `price-${product._id}`;

    const cartBtn = tClone.querySelector('button');
    cartBtn.id = `add-to-cart-${product._id}`;

    productsContainer.appendChild(tClone);
  });
};

/**
 * 
 * Listens to the buttons of the product in order to add them to the cart
 * 
 */

showProducts().then(() => {
  productsContainer.querySelectorAll('button').forEach(btn =>
    btn.addEventListener('click', e => {
      const productId = e.target.id.replace('add-to-cart-', '');
      addProductToCart(productId);

      const productName = e.target.parentNode.querySelector(
        `#name-${productId}`
      ).innerHTML;

      createNotification(
        `Added ${productName} to cart!`,
        'notifications-container'
      );
    })
  );
});
