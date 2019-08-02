const express = require('express');
const router = express.Router();
const database = require('../databaseConnection/database.js');

router.post('/products', (req, res) => {
    database.createProduct(req)
        .then(data => {
            res.status(201);
            res.send(data);
        })
        .catch(error =>{
            res.status(404);
            res.send(error);
        });
});

router.post('/orders', (req, res) => {
    database.createOrder(req)
        .then(data => {
            res.status(201);
            res.send(data);
        })
        .catch(error =>{
            res.status(404);
            res.send(error);
        });
});


module.exports = router;