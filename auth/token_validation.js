const { verify } = require("jsonwebtoken");

module.exports = {
  checkToken: (req, res, next) => {
    let token = req.get("authorization");

    if (token) {
      token = token.slice(7);

      verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
          res.status(403).json({
            success: 0,
            message: "Invalid token."
          });
        } else {
          next(); // proceed to next middleware
        }
      });
    } else {
      res.status(401).json({
        success: 0,
        message: "Access denied. Unauthorized user."
      });
    }
  },
  checkIfAdmin: (req, res, next) => {
    let token = req.get("authorization");

    if (token) {
      token = token.slice(7);

      verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (decoded.result.role !== "admin") {
          res.json({
            success: 0,
            message: "You are not authorized to do this action."
          });
        } else {
          next();
        }
      });
    }
  },
  checkIfOwner: (req, res, next) => {
    let token = req.get("authorization");
    let id;

    if (token) {
      token = token.slice(7);

      if (req.params.userId) {
        id = +req.params.userId;
      } else {
        id = +req.body.userId;
      }

      verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (decoded.result.id !== id) {
          res.json({
            success: 0,
            message: "You are not authorized to do this action."
          });
        } else {
          next();
        }
      });

    }
  }
};
