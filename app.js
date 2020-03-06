require("dotenv").config();
const express = require('express');
const app = express();

/* const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY; */

const userRouter = require("./api/users/user.router");
const productRouter = require("./api/products/product.router");
const cartRouter = require('./api/cart/cart.router');
const billingRouter = require('./api/billing/billing.router');
const orderRouter = require('./api/orders/order.router');

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // * means any
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
  });

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/billing", billingRouter);
app.use("/api/orders", orderRouter);

app.listen(process.env.APP_PORT, () => {
    console.log("Node server up @ localhost:" + process.env.APP_PORT);
});

/* schema plan

*stand alone
accounts
products
categories
keywords

*references other table (one to many)
products -> product_images

*many to many
accounts <- cart_items -> products
accounts <- reviews -> products

products <- product_keywords -> keywords
products <- product_categories -> categories


 */