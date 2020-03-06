const pool = require("../../config/database");

module.exports = {
  createOrder: (data, callBack) => {
    pool.query(``, [], (err, results, fields) => {
      if (err) {
        return callBack(err);
      }

      return callBack(null, results);
    });
  },
  getOrdersByUserId: (userId, callBack) => {

    /* pool.query(
      `SELECT
    orders.id AS orderId,
    receiver_fname AS firstName,
    receiver_lname AS lastName,
    receiver_shipping_address AS shippingAddress,
    receiver_contact_number AS contactNumber,
    receiver_email AS email,
    DATE_FORMAT(date_time, '%b %e, %Y') AS date,
    account_id AS userId,
    status
FROM
    orders
WHERE
    orders.account_id = ?; `,
      [userId],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    ); */

    pool.query(
      `SELECT
      orders.id AS orderId,
      receiver_fname AS firstName,
      receiver_lname AS lastName,
      receiver_shipping_address AS shippingAddress,
      receiver_contact_number AS contactNumber,
      receiver_email AS email,
      DATE_FORMAT(date_time, '%b %e, %Y') AS date,
      account_id AS userId,
      status,
      GROUP_CONCAT(CONCAT(products.id)
          SEPARATOR ', ') AS orderItemsProductId,
      GROUP_CONCAT(CONCAT(products.product_name)
          SEPARATOR ', ') AS orderItemsProductName,
    GROUP_CONCAT(CONCAT(order_items.quantity)
          SEPARATOR ', ') AS orderItemsQuantity,
          GROUP_CONCAT(CONCAT(products.product_price)
        SEPARATOR ', ') AS orderItemsPrice
  FROM
      orders
          JOIN
      order_items ON orders.id = order_items.order_id
          JOIN
      products ON products.id = order_items.product_id
  WHERE
      orders.account_id = ?
  GROUP BY orders.id ORDER BY orderId DESC;`,
      [userId],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  getOrderItems: (data, callBack) => {
    pool.query(`SELECT
    orders.id AS orderId,
    order_items.product_id AS productId,
    product_name AS productName,
    product_price AS productPrice,
    quantity AS quantity
FROM
    orders
        JOIN
    order_items ON orders.id = order_items.order_id
        JOIN
    products ON order_items.product_id = products.id
WHERE
    orders.account_id = ? && orders.id = ?;`, [data.userId, data.orderId], (err, results, fields) => {
      if (err) {
        return callBack(err);
      }

      return callBack(null, results);
    });
  }
};
