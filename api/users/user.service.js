const pool = require("../../config/database");

module.exports = {
  create: (data, callBack) => {
    // data is the input of the user
    pool.query(
      `INSERT INTO accounts (first_name, last_name, email, password)
       VALUES (?, ?, ?, ?);
       INSERT INTO user_details (contact_number, delivery_address, account_id)
       VALUES (?, ?, (SELECT id FROM accounts WHERE email = ?))`,
      [
        data.first_name,
        data.last_name,
        data.email,
        data.password,
        data.contact_number,
        data.delivery_address,
        data.email
      ],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  getUsers: callBack => {
    pool.query(`SELECT * from accounts`, [], (err, results, fields) => {
      if (err) {
        // if sql query throws an error
        return callBack(err);
      }

      return callBack(null, results); // if success, error will be null
    });
  },
  getUserById: (id, callBack) => {
    pool.query(
      `SELECT * FROM accounts WHERE id = ?`,
      [id],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results[0]); // index zero to satisfy the record not found condition
      }
    );
  },
  getUserByEmail: (email, callBack) => {
    pool.query(
      `SELECT * FROM accounts WHERE email = ?`,
      [email],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results[0]); // index zero to satisfy the record not found condition
      }
    );
  },
  getUserInfo: (userId, callBack) => {
    pool.query(
      `SELECT
      accounts.id AS userId,
      first_name AS firstName,
      last_name AS lastName,
      email AS email,
      contact_number AS contactNumber,
      delivery_address AS deliveryAddress,
      role
  FROM
      accounts
          JOIN
      user_details ON accounts.id = user_details.account_id
  WHERE
      accounts.id = ?;`,
      [userId],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }

        return callBack(null, results);
      }
    );
  },
  updateUser: (data, callBack) => {
    pool.query(
      `UPDATE accounts SET first_name = ?, last_name = ?, email = ? WHERE id = ?; UPDATE user_details SET contact_number = ?, delivery_address = ? WHERE account_id = ?;`,
      [data.firstName, data.lastName, data.email, data.userId, data.contactNumber, data.deliveryAddress, data.userId],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }

        return callBack(null, results);
      }
    );
  },
  deleteUserById: (id, callBack) => {
    pool.query(
      `DELETE FROM accounts WHERE id = ?`,
      [id, id],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  checkIfEmailExists: (email, callBack) => {
    pool.query(
      `SELECT email FROM accounts WHERE email = ?;`,
      [email],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  updatePassword: (data, callBack) => {
    pool.query(`UPDATE accounts SET password = ? WHERE id = ?;`, [data.newPassword, data.userId], (err, results, fields) => {
      if (err) {
        return callBack(err);
      }

      return callBack(null, results);
    });
  }
};
