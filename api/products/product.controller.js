const { updateProduct ,getProductKeywords, adminGetProducts, getKeywords, getProducts, getProductById, getProductPhotosById, getProductReviewsById, getSubCategories, getCategories, getProductsByCategory, createProduct } = require("./product.service");

module.exports = {
    getProducts: (req, res) => {
      const queryParams = req.query;

        getProducts(queryParams, (err, results) => {
            if (err) {
                //console.log(err);
                return res.status(500).json({
                  success: 0,
                  message: err
                });
              }

              return res.status(200).json({
                success: 1,
                products: results
              });
        });
    },
    getProductById: (req, res) => {
      const id = req.params.id;

      getProductById(id, (err, results) => {
        if (err) {
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
          product: results
        });
      });
    },
    getProductPhotosById: (req, res) => {
      const id = req.params.id;

      getProductPhotosById(id, (err, results) => {
        if (err) {
          return res.status(500).json({
            success: 0,
            message: err
          });
        }

        if (results.length === 0) {
          return res.json({
            success: 0,
            message: "No results."
          });
        }

        return res.status(200).json({
          success: 1,
          imgUrls: results
        });
      });
    },
    getProductReviewsById: (req, res) => {
      const id = req.params.id;
      const queryParams = req.query;

      getProductReviewsById(id, queryParams, (err, results) => {
        if (err) {
          return res.status(500).json({
            success: 0,
            message: err
          });
        }

        if (results.length === 0) {
          return res.json({
            success: 0,
            message: "No results."
          });
        }

        return res.status(200).json({
          success: 1,
          reviews: results
        });
      });
    },
    getSubCategories: (req, res) => {
      const category = req.params.category;

      getSubCategories(category, (err, results) => {
        if (err) {
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
    getCategories: (req, res) => {
      getCategories((err, results) => {
        if (err) {
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
    getProductsByCategory: (req, res) => {
      const data = { queryParams: req.query, params: req.params };

      getProductsByCategory(data, (err, results) => {
        if (err) {
            //console.log(err);
            return res.status(500).json({
              success: 0,
              message: err
            });
          }

          return res.status(200).json({
            success: 1,
            products: results
          });
    });
    },
    createProduct: (req, res) => {
      const body = req.body;

      for (property in body) { // check if any of the fields is empty
        console.log(body[property]);
        if (!body[property].toString().trim()) {
          return res.status(400).json({
            success: 0,
            message: 'Please re-check your inputs.'
          });
        }
      }

      createProduct(body, (err, results) => {
        if (err) {
          return res.status(500).json({
            success: 0,
            message: err
          });
        }

        return res.status(200).json({
          success: 1,
          message: 'Product successfully created.'
        });
      })
    },
    getKeywords: (req, res) => {
      getKeywords((err, results) => {
        if (err) {
            //console.log(err);
            return res.status(500).json({
              success: 0,
              message: err
            });
          }

          return res.status(200).json({
            success: 1,
            keywords: results
          });
    });
    },
    adminGetProducts: (req, res) => {
      adminGetProducts((err, results) => {
        if (err) {
            //console.log(err);
            return res.status(500).json({
              success: 0,
              message: err
            });
          }

          return res.status(200).json({
            success: 1,
            products: results
          });
    })
    },
    getProductKeywords: (req, res) => {
      const userId = req.params.id;

      getProductKeywords(userId, (err, results) => {
        if (err) {
            //console.log(err);
            return res.status(500).json({
              success: 0,
              message: err
            });
          }

          return res.status(200).json({
            success: 1,
            keywords: results
          });
    });
    },
    updateProduct: (req, res) => {
      const body = req.body;

      for (property in body) { // check if any of the fields is empty
        console.log(body[property]);
        if (!body[property].toString().trim()) {
          return res.status(400).json({
            success: 0,
            message: 'Please re-check your inputs.'
          });
        }
      }

      updateProduct(body, (err, results) => {
        if (err) {
          return res.status(500).json({
            success: 0,
            message: err
          });
        }

        return res.status(200).json({
          success: 1,
          message: 'Product successfully updated.'
        });
      });
    }
};