const pool = require("../../config/database");

function generateRepeatingQuery(arr, query) {
    let builtQuery = "";

    for (obj of arr) {
        builtQuery += query;
    }

    return builtQuery;
}

function generateOrderItemsValues(arr, stripeToken) {
    const generatedValues = [];

    for (obj of arr) {
        generatedValues.push(obj.quantity, stripeToken, obj.productId);
    }

    return generatedValues;
}

module.exports = {
  checkout: (data, callBack) => {
    const values = [];
    const insertToOrdersQuery = "INSERT INTO orders (receiver_fname, receiver_lname, receiver_shipping_address, receiver_contact_number, receiver_email, account_id, status, stripeToken) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";

    values.push(data.checkoutForm.firstName, data.checkoutForm.lastName, data.checkoutForm.deliveryAddress, data.checkoutForm.contactNumber, data.checkoutForm.email, data.userId, 'Processing', data.stripeToken);

    const insertToOrderItemsQuery = generateRepeatingQuery(data.items, " INSERT INTO order_items (quantity, order_id, product_id) VALUES (?, (SELECT orders.id FROM orders WHERE stripeToken = ?), ?);");

    values.push(...generateOrderItemsValues(data.items, data.stripeToken));

    const clearUsersCartQuery = " DELETE FROM cart_items_v2 WHERE account_id = ?;";

    values.push(data.userId);

    const query = insertToOrdersQuery + insertToOrderItemsQuery + clearUsersCartQuery;

    pool.query(
      query,
      values,
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  }
};
