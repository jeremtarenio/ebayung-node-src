const pool = require("../../config/database");

module.exports = {
  getCartByUserId: (userId, callBack) => {
    pool.query(
      `SELECT
      products.id AS productId,
      product_name AS productName,
      product_price AS productPrice,
      quantity,
      product_price * quantity AS total,
      image_url AS imgUrl
  FROM
      accounts
          JOIN
      cart_items_v2 ON accounts.id = cart_items_v2.account_id
          JOIN
      products ON products.id = cart_items_v2.product_id
          JOIN
      (SELECT
          *
      FROM
          product_images
      GROUP BY product_images.product_id) AS product_images ON products.id = product_images.product_id
  WHERE
      accounts.id = ? ORDER BY cart_items_v2.id;`,
      [userId],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  addToCart: (data, callBack) => {
    pool.query(
      `INSERT INTO cart_items_v2 (account_id, product_id, quantity) VALUES (?, ?, ?);`,
      [data.userId, data.productId, data.quantity],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  updateCartItemQuantity: (data, callBack) => {
    pool.query(
      `UPDATE cart_items_v2
      SET
          quantity = quantity ` +
        data.operator +
        ` ?
      WHERE
          account_id = ? AND product_id = ?;
      DELETE FROM cart_items_v2 WHERE quantity = 0`,
      [data.quantity, data.userId, data.productId],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  deleteCartItem: (data, callBack) => {
    pool.query(
      `DELETE FROM cart_items_v2 WHERE account_id = ? AND product_id = ?;`,
      [data.userId, data.productId],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  checkIfCartItemExists: (data, callBack) => {
    pool.query(
      `SELECT * FROM cart_items_v2 WHERE account_id = ? AND product_id = ?;`,
      [data.userId, data.productId],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  getCartTotalByUserId: (userId, callBack) => {
    pool.query(
      `SELECT
    SUM(product_price * quantity) cartTotal
FROM
    accounts
        JOIN
    cart_items_v2 ON accounts.id = cart_items_v2.account_id
        JOIN
    products ON products.id = cart_items_v2.product_id
WHERE
    accounts.id = ?
ORDER BY cart_items_v2.id; `,
      [userId],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  }
};
