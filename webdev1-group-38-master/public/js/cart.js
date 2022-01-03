const cartContainer = document.getElementById('cart-container');
const itemTemplate = document.querySelector('#cart-item-template');

/**
 * 
 * Presents the products in their cart for the user
 * 
 * */

const showProducts = async () => {
  const resourceURI = `/api/products`;
  const jsonData = await getJSON(resourceURI);
  const products = getAllProductsFromCart();

  return await jsonData.forEach(product => {
    const productId = product._id;
    if (!Object.keys(products).includes(productId)) return;

    const tClone = itemTemplate.content.cloneNode(true);

    const row = tClone.querySelector('.item-row');
    row.id = `item-${productId}`;

    const name = tClone.querySelector('.product-name');
    name.innerHTML = product.name;
    name.id = `name-${productId}`;

    const price = tClone.querySelector('.product-price');
    price.innerHTML = product.price;
    price.id = `price-${productId}`;

    const amount = tClone.querySelector('.product-amount');
    amount.innerHTML = `${products[productId]}x`;
    amount.id = `amount-${productId}`;

    const [plusBtn, minusBtn] = tClone.querySelectorAll(
      '.cart-minus-plus-button'
    );
    plusBtn.id = `plus-${productId}`;
    minusBtn.id = `minus-${productId}`;

    cartContainer.appendChild(tClone);
  });
};

/**
 * 
 * Listens to the amount of products to be added to the shopping cart
 * of the user.
 * 
 */

showProducts().then(() => {
  cartContainer.querySelectorAll('.cart-minus-plus-button').forEach(btn =>
    btn.addEventListener('click', e => {
      const [type, productId] = e.target.id.split('-');
      const amount = e.target.parentNode.querySelector(`#amount-${productId}`);
      switch (type) {
        case 'minus':
          if (getProductCountFromCart(productId) > 1) {
            decreaseProductCount(productId);
          } else {
            removeProductFromCart(productId);
            removeElement('cart-container', e.target.parentNode.id);
            return;
          }
          break;
        case 'plus':
          addProductToCart(productId);
          break;
      }

      amount.innerHTML = `${getProductCountFromCart(productId)}x`;
    })
  );

  document.getElementById('place-order-button').addEventListener('click', e => {
    createNotification(
      `Successfully created an order!`,
      'notifications-container'
    );

    cartContainer.querySelectorAll('.item-row').forEach(item => item.remove());
    clearCart();
  });
});
