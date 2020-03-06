const { getCartByUserId, addToCart, checkIfCartItemExists, updateCartItemQuantity, deleteCartItem, getCartTotalByUserId } = require("./cart.service");

module.exports = {
  getCartByUserId: (req, res) => {
    const userId = req.params.userId;

    getCartByUserId(userId, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      return res.status(200).json({
        success: 1,
        cartItems: results
      });
    });
  },
  addToCart: (req, res) => {
    const body = req.body;

    addToCart(body, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      return res.status(200).json({
        success: 1,
        message: 'Added successfully.'
      });
    });
  },
  updateCartItemQuantity: (req, res) => {
    const body = req.body;

    updateCartItemQuantity(body, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      return res.status(200).json({
        success: 1,
        message: 'Updated successfully.'
      });
    });
  },
  deleteCartItem: (req, res) => {
    const params = req.params;

    deleteCartItem(params, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      return res.status(200).json({
        success: 1,
        message: 'Deleted successfully.'
      });
    });
  },
  checkIfCartItemExists: (req, res) => {
    const body = req.body;

    checkIfCartItemExists(body, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      if (results.length === 0) {
        return res.status(200).json({
          cartExists: false
        });
      }

      return res.status(200).json({
        cartExists: true
      });
    });
  },
  getCartTotalByUserId: (req, res) => {
    const userId = req.params.userId;

    getCartTotalByUserId(userId, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      return res.status(200).json({
        success: 1,
        cartTotal: results[0].cartTotal
      });
    })
  }
};
