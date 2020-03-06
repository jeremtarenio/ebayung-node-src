const pool = require("../../config/database");
const queryString = require("query-string");

function convertStringToArray(arr) {
  return queryString.parse("filters=" + arr.replace(/\s+/g, ""), {
    arrayFormat: "comma"
  }).filters;
}

function convertSingleFilterToArray(arr) {
  let temp = [];
  temp.push(arr);
  return temp;
}

function generatePlaceholder(arr) {
  let placeholder = ""

  for (let i = 0; i < arr.length; i++) {
    placeholder = i === arr.length - 1 ? (placeholder += "?") : (placeholder += "?, ");
  }

  return placeholder
}

function generateRepeatingQuery(arr, query) {
  let builtQuery = "";

  for (obj of arr) {
      builtQuery += query;
  }

  return builtQuery;
}

function generateValues(arr) {
  const generatedValues = [];

  for (obj of arr) {
      generatedValues.push(obj);
  }

  return generatedValues;
}

function generateImgUrlValues(arr, productId) {
  const generatedValues = [];

  for (obj of arr) {
    generatedValues.push(obj, productId);
  }

return generatedValues;
}

function generateKeywordValues(arr, productId) {
  const generatedValues = [];

  for (obj of arr) {
    generatedValues.push(productId, obj);
  }

return generatedValues;
}

module.exports = {
  getProducts: (queryParams, callBack) => {
    const filters = queryParams.filters;
    const sortBy = !queryParams.sortBy ? "noOfRatings" : queryParams.sortBy;
    const order = !queryParams.order ? "DESC" : queryParams.order;
    const q = !queryParams.q ? "" : queryParams.q;
    const values = [q];

    let filtersArray = filters ? convertStringToArray(filters) : null;

    filtersArray = !Array.isArray(filtersArray) && filtersArray ? convertSingleFilterToArray(filtersArray) : filtersArray;
    if (filtersArray) { values.push(...filtersArray) }

    const filtersPlaceholder = filtersArray ? generatePlaceholder(filtersArray) : null;

    const searchPortion = " WHERE product_name LIKE CONCAT('%', ?,  '%')"
    const filtersPortion = filtersPlaceholder ? (" && keyword IN (" + filtersPlaceholder + ")") : "";
    const sortByPortion = " ORDER BY " + sortBy;
    const orderPortion = " " + order;

    const query = `SELECT
    products.id AS 'id',
    product_name AS 'name',
    product_price AS price,
    AVG(rating) AS 'averageRating',
    COUNT(rating) AS 'noOfRatings',
    image_url AS 'imgUrl'
FROM
    products
        LEFT JOIN
    reviews ON products.id = reviews.product_id
        LEFT JOIN
    (SELECT
        *
    FROM
        product_images
    GROUP BY product_id) AS product_images ON products.id = product_images.product_id
        LEFT JOIN
    product_keywords ON products.id = product_keywords.product_id
        LEFT JOIN
    keywords ON keywords.id = product_keywords.keyword_id` + searchPortion + filtersPortion + ` GROUP BY products.id` + sortByPortion + orderPortion;

    pool.query(query, values, (err, results, fields) => {
      if (err) {
        return callBack(err);
      }

      return callBack(null, results);
    });
  },
  getProductById: (id, callBack) => {
    pool.query(
      `SELECT
                    products.id AS id,
                    product_name AS name,
                    product_price AS price,
                    product_desc_1 AS productDesc1,
                    product_desc_2 AS productDesc2,
                    product_desc_3 AS productDesc3,
                    AVG(rating) AS averageRating,
                    COUNT(rating) AS noOfRatings,
                    category,
                    subcategory
                FROM
                      products
                        LEFT JOIN
                    reviews ON products.id = reviews.product_id
                WHERE
                    products.id = ?
                GROUP BY products.id;`,
      [id],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results[0]); // index zero to satisfy the record not found condition
      }
    );
  },
  getProductPhotosById: (id, callBack) => {
    pool.query(
      `SELECT
                    image_url AS imgUrl
                FROM
                    products
                        JOIN
                    product_images ON products.id = product_images.product_id
                WHERE
                    products.id = ?;`,
      [id],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  getProductReviewsById: (id, queryParams, callBack) => {
    if (!queryParams.sortBy) {
      queryParams.sortBy = "date_time";
    }

    if (!queryParams.order) {
      queryParams.order = "DESC";
    }

    pool.query(
      `SELECT
                    reviews.id AS reviewId,
                    reviews.rating,
                    reviews.title,
                    reviews.description,
                    CONCAT(accounts.first_name,
                            ' ',
                            accounts.last_name) AS user,
                    reviews.helpful_points AS helpfulPoints,
                    DATE_FORMAT(date_time, '%e %b %Y') AS date
                FROM
                    products
                        JOIN
                    reviews ON products.id = reviews.product_id
                        JOIN
                    accounts ON accounts.id = reviews.account_id
                WHERE
                    products.id = ?
                ORDER BY ` +
        queryParams.sortBy +
        ` ` +
        queryParams.order +
        `;`,
      [id],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  getProductsByCategory: (data, callBack) => {
    const subcategories = data.queryParams.subcategories;
    const filters = data.queryParams.filters;
    const category = data.params.category;
    const sortBy = !data.queryParams.sortBy ? "noOfRatings" : data.queryParams.sortBy;
    const order = !data.queryParams.order ? "DESC" : data.queryParams.order;
    const values = [category];

    let filtersArray = filters ? convertStringToArray(filters) : null;
    let subcategoriesArray = subcategories ? convertStringToArray(subcategories) : null;

    filtersArray = !Array.isArray(filtersArray) && filtersArray ? convertSingleFilterToArray(filtersArray) : filtersArray;
    if (filtersArray) { values.push(...filtersArray) }
    subcategoriesArray = !Array.isArray(subcategoriesArray) && subcategoriesArray ? convertSingleFilterToArray(subcategoriesArray) : subcategoriesArray;
    if (subcategoriesArray) { values.push(...subcategoriesArray) }

    const filtersPlaceholder = filtersArray ? generatePlaceholder(filtersArray) : null;
    const subcategoriesPlaceholder = subcategoriesArray ? generatePlaceholder(subcategoriesArray) : null;

    let categoryPortion = " WHERE category = ?";
    const filtersPortion = filtersPlaceholder ? (" && keyword IN (" + filtersPlaceholder + ")") : "";
    const subcategoriesPortion = subcategoriesPlaceholder ? (" && subcategory IN (" + subcategoriesPlaceholder + ")") : "";
    const sortByPortion = " ORDER BY " + sortBy;
    const orderPortion = " " + order;

    const query = `SELECT
    products.id AS 'id',
    product_name AS 'name',
    product_price AS price,
    AVG(rating) AS 'averageRating',
    COUNT(rating) AS 'noOfRatings',
    image_url AS 'imgUrl'
FROM
    products
        LEFT JOIN
    reviews ON products.id = reviews.product_id
        LEFT JOIN
    (SELECT
        *
    FROM
        product_images
    GROUP BY product_id) AS product_images ON products.id = product_images.product_id
        LEFT JOIN
    product_keywords ON products.id = product_keywords.product_id
        LEFT JOIN
    keywords ON keywords.id = product_keywords.keyword_id` + categoryPortion + filtersPortion + subcategoriesPortion + ` GROUP BY products.id` + sortByPortion + orderPortion;

    pool.query(query, values, (err, results, fields) => {
      if (err) {
        return callBack(err);
      }

      return callBack(null, results);
    });
  },
  getSubCategories: (category, callBack) => {
    pool.query(
      `SELECT
      subcategory AS 'subCategory', COUNT(*) AS 'count'
      FROM
          products
      WHERE
          category = ?
      GROUP BY subcategory;`,
      [category],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  getCategories: callBack => {
    pool.query(
      `SELECT DISTINCT category FROM products;`,
      [],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
  createProduct: (data, callBack) => {
    const values = [];

    const inserToProductsQuery = `INSERT INTO products (product_name, product_price, product_desc_1, product_desc_2, product_desc_3, category, subcategory) VALUES (?, ?, ?, ?, ?, ?, ?);`;

    values.push(data.productName, data.price, data.desc1, data.desc2, data.desc3, data.category, data.subcategory);

    const insertToUrlsQuery = generateRepeatingQuery(data.imgUrls, ` INSERT INTO product_images (image_url, product_id) VALUES (?, (SELECT LAST_INSERT_ID()));`);

    values.push(...generateValues(data.imgUrls));

    const insertToKeywordsQuery = generateRepeatingQuery(data.keywords, ` INSERT INTO product_keywords (product_id, keyword_id) VALUES ((SELECT LAST_INSERT_ID()), ?);`);

    values.push(...generateValues(data.keywords));

    const query = inserToProductsQuery + insertToUrlsQuery + insertToKeywordsQuery;

    /* console.log(values); */


    pool.query(query, values,(err, results, fields) => {
      if (err) {
        return callBack(err);
      }

      return callBack(null, results);
    });

  },
  getKeywords: callBack => {
    pool.query(`SELECT * FROM keywords;`, [], (err, results, fields) => {
      if (err) {
        return callBack(err);
      }

      return callBack(null, results);
    });
  },
  adminGetProducts: callBack => {
    pool.query(`SELECT * FROM products;`, [], (err, results, fields) => {
      if (err) {
        return callBack(err);
      }

      return callBack(null, results);
    });
  },
  getProductKeywords: (userId, callBack) => {
    pool.query(`SELECT
    product_id AS productId,
    keyword_id AS keywordId,
    keyword
FROM
    product_keywords
        JOIN
    keywords ON product_keywords.keyword_id = keywords.id WHERE product_id = ?;`, [userId], (err, results, fields) => {
      if (err) {
        return callBack(err);
      }

      return callBack(null, results);
    });
  },
  updateProduct: (data, callBack) => {
    const values = [];

    const updateProductQuery = `UPDATE products SET product_name = ?, product_price = ?, product_desc_1 = ?, product_desc_2 = ?, product_desc_3 = ?, category = ?, subcategory = ? WHERE id = ?;`;

    values.push(data.productName, data.price, data.desc1, data.desc2, data.desc3, data.category, data.subcategory, data.productId);

    const deleteExistingImgUrlsQuery = ` DELETE FROM product_images WHERE product_id = ?;`
    values.push(data.productId);

    const insertNewImgUrls = generateRepeatingQuery(data.imgUrls, ` INSERT INTO product_images (image_url, product_id) VALUES (?, ?);`);
    values.push(...generateImgUrlValues(data.imgUrls, data.productId));

    const deleteExistingKeywordsQuery = ` DELETE FROM product_keywords WHERE product_id = ?;`;
    values.push(data.productId);

    const insertNewKeywords = generateRepeatingQuery(data.keywords, ` INSERT INTO product_keywords (product_id, keyword_id) VALUES (?, ?);`)
    values.push(...generateKeywordValues(data.keywords, data.productId));

    const query = updateProductQuery + deleteExistingImgUrlsQuery + insertNewImgUrls + deleteExistingKeywordsQuery + insertNewKeywords;

    pool.query(query, values, (err, results, fields) => {
      if (err) {
        return callBack(err);
      }

      return callBack(null, results);
    });
  }
};
