const {
  create,
  getUsers,
  getUserById,
  updateUser,
  deleteUserById,
  getUserByEmail,
  checkIfEmailExists,
  getUserInfo,
  updatePassword
} = require("./user.service");

const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");

module.exports = {
  createUser: (req, res) => {
    const body = req.body;
    const salt = genSaltSync(10);

    const emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    const passwordRegEx = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-+,.]).{8,}$/;

    // validation
    if (!body.first_name) {
      return res.status(400).json({
        success: 0,
        err_code: 'First name is invalid.'
      });
    } else if (!body.last_name) {
      return res.status(400).json({
        success: 0,
        err_code: 'Last name is invalid.'
      });
    } else if (!emailRegEx.test(body.email)) {
      return res.status(400).json({
        success: 0,
        err_code: 'E-mail is invalid.'
      });
    } else if (!body.password) {
      return res.status(400).json({
        success: 0,
        err_code: 'Password is required.'
      });
    } else if (body.password.length < 8) {
      return res.status(400).json({
        success: 0,
        err_code: 'Password must be at least 8 characters.'
      });
    } else if (!passwordRegEx.test(body.password)) {
      return res.status(400).json({
        success: 0,
        err_code: 'Password must have at least one lowercase & uppercase letter, one number & one special character.'
      });
    } else if (!body.contact_number) {
      return res.status(400).json({
        success: 0,
        err_code: 'Contact number is required.'
      });
    }

    body.password = hashSync(body.password, salt); // encryption

    create(body, (err, results) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            success: 0,
            err_code: 'E-mail already exists.'
          });
        }
      }

      return res.status(200).json({
        success: 1,
        data: results
      });
    });
  },
  getUsers: (req, res) => {
    getUsers((err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      return res.status(200).json({
        success: 1,
        data: results
      });
    });
  },
  getUserById: (req, res) => {
    const id = req.params.userId;

    getUserById(id, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      if (!results) {
        return res.json({
          success: 0,
          message: "Record not found!"
        });
      }

      return res.status(200).json({
        success: 1,
        data: results
      });
    });
  },
  updateUser: (req, res) => {
    const body = req.body;

    for (property in body) { // check if fields are empty
      if (body[property] === null || !body[property].trim()) {
        return res.status(400).json({
          success: 0,
          message: 'Empty inputs are not allowed.'
        });
      }
    }

    getUserInfo(body.userId, (err, results) => { // check if the updated email submitted is the same as the current
      if (err) {
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      if (results[0].email !== body.email) { // if not, check if email exists
        checkIfEmailExists(body.email, (err, results) => {
          if (err) {
            return res.status(500).json({
              success: 0,
              message: err
            });
          }

          // if email exists, return 400
          if (results.length !== 0) {
            return res.status(400).json({
              success: 0,
              message: 'E-mail is taken.'
            });
          } else {
            updateUser(body, (err, results) => {
              if (err) {
                return res.status(500).json({
                  success: 0,
                  message: err
                });
              }

              return res.status(200).json({
                success: 1,
                result: 'Update success.'
              });
            });
          }
        })
      } else { // else, update user
        updateUser(body, (err, results) => {
          if (err) {
            return res.status(500).json({
              success: 0,
              message: err
            });
          }

          return res.status(200).json({
            success: 1,
            result: 'Update success.'
          });
        });
      }
    })

  },
  deleteUserById: (req, res) => {
    const id = req.params.id;

    deleteUserById(id, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      if (results.affectedRows === 0) {
        return res.json({
          success: 0,
          message: "Delete unsuccessful. No record found!"
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Delete success. " + results.affectedRows + " row(s) affected."
      });
    });
  },
  login: (req, res) => {
    const body = req.body;

    getUserByEmail(body.email, (err, results) => {
      if (err) {
        console.log(err);
      }

      if (!results) {
        return res.status(401).json({
          success: 0,
          message: "Invalid e-mail or password."
        });
      }

      const result = compareSync(body.password, results.password);

      const expiry = 86400000; // 24hrs

      if (result) {
        results.password = undefined; // do NOT store the password in the token
        const jsontoken = sign({ result: results }, process.env.JWT_SECRET_KEY, {
          expiresIn: expiry
        });

        return res.json({
          success: 1,
          message: "Login success.",
          userId: results.id,
          token: jsontoken,
          expiry: expiry,
          role: results.role
        });
      } else {
        return res.status(401).json({
          success: 0,
          message: "Invalid e-mail or password."
        });
      }
    });
  },
  checkIfEmailExists: (req, res) => {
    const body = req.body;

    checkIfEmailExists(body.email, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      return res.status(200).json({
        success: 1,
        forbiddenEmails: results
      });
    });
  },
  getUserInfo: (req, res) => {
    const id = req.params.userId;

    getUserInfo(id, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      return res.status(200).json({
        success: 1,
        result: results
      });
    });
  },
  updatePassword: (req, res) => {
    const body = req.body;
    const salt = genSaltSync(10);
    const passwordRegEx = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-+,.]).{8,}$/;


    getUserById(body.userId, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      const isSame = compareSync(body.oldPassword, results.password);

      if (isSame) {
        if (!passwordRegEx.test(body.newPassword) || body.newPassword.length < 8) {
          return res.status(400).json({
            success: 0,
            message: 'Password must have at least one lowercase & uppercase letter, one number & one special character. Minimum of 8 characters.'
          });
        }

        body.newPassword = hashSync(body.newPassword, salt); // encryption

        updatePassword(body, (err, results) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              success: 0,
              message: err
            });
          }

          return res.status(200).json({
            success: 1,
            result: 'Updated successfully.'
          });
        });
      } else {
        return res.status(400).json({
          success: 0,
          message: 'Incorrect password.'
        });
      }
    })
  }
};
