const { checkout } = require("./billing.service");
const { getCartTotalByUserId } = require("../cart/cart.service");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = {
  checkout: (req, res) => {
    const body = req.body;
    const emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    for (property in body.checkoutForm) { // check if any of the fields is empty
      if (!body.checkoutForm[property].toString().trim()) {
        return res.status(400).json({
          success: 0,
          message: 'Please re-check your inputs.'
        });
      }
    }

    if (!emailRegEx.test(body.checkoutForm.email.trim())) { // check e-mail validity
      return res.status(400).json({
        success: 0,
        message: 'Please re-check your inputs.'
      });
    }

    if (body.items.length === 0) { // check if order list contains anything
      return res.status(400).json({
        success: 0,
        message: 'Orders is empty.'
      });
    }

    getCartTotalByUserId(body.userId, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      stripe.charges // charge
        .create({
          amount: Math.round(results[0].cartTotal * 100),
          source: req.body.stripeToken,
          currency: "php"
        })
        .then(() => { // if charge successful
          checkout(body, (err, results) => {
            if (err) {
              return res.status(500).json({
                success: 0,
                message: err
              });
            }

            return res.status(200).json({
              success: 1,
              msg: "Payment successful."
            });
          });
        })
        .catch(() => { // if charge error
          return res.status(500).json({
            success: 0,
            message: err
          });
        });
    });
  }
};
