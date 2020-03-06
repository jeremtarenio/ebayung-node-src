const { getOrdersByUserId, getOrderItems } = require("./order.service");

function convertGroupConcatsToObjects(productIdArr, productNameArr, priceArr, quantityArr) {
  let arraysOfObjects = [];

  for (let i = 0; i < productIdArr.length; i++) {
    let newObj = {};
    newObj['productId'] = productIdArr[i];
    newObj['productName'] = productNameArr[i];
    newObj['price'] = priceArr[i];
    newObj['quantity'] = quantityArr[i];
    arraysOfObjects.push(newObj);
  }

  return arraysOfObjects;
}

function attachConverted(arr) {
  const copy = arr.slice();

  for (let i = 0; i < copy.length; i++) {
    copy[i].orderItems = convertGroupConcatsToObjects(copy[i]['orderItemsProductId'].split(", "), copy[i]['orderItemsProductName'].split(", "), copy[i]['orderItemsPrice'].split(", "), copy[i]['orderItemsQuantity'].split(", "));
  }

  return copy;
}

function removeHelperProperties(arr) {
  const final = [];

  for (let i = 0; i < arr.length; i++) {
    final.push({
      orderId: arr[i].orderId,
      firstName: arr[i].firstName,
      lastName: arr[i].lastName,
      shippingAddress: arr[i].shippingAddress,
      contactNumber: arr[i].contactNumber,
      email: arr[i].email,
      date: arr[i].date,
      userId: arr[i].userId,
      status: arr[i].status,
      orderItems: arr[i].orderItems
    })
  }

  return final;
}

module.exports = {
  getOrdersByUserId: (req, res) => {
    const userId = req.params.userId;

    getOrdersByUserId(userId, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: err
        });
      }

      return res.status(200).json({
        success: 1,
        orders: removeHelperProperties(attachConverted(results))
      });

    });
  },
  getOrderItems: (req, res) => {
      const params = req.params

      getOrderItems(params, (err, results) => {
        if (err) {
          return res.status(500).json({
            success: 0,
            message: err
          });
        }

        return res.status(200).json({
          success: 1,
          orderItems: results
        });

      })
  },
  getOrdersV2: (req, res) => {

  }
};
