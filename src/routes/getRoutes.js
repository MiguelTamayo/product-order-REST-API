const express = require('express');
const router = express.Router();
const database = require('../databaseConnection/database.js');


router.get('/orders', (req, res) => {
    database.getAllOrders()
        .then(data => {
            res.status(200);
            res.send(data);
        })
        .catch(error =>{
            res.status(404);
            res.send(error);
        });
});

router.get('/orders/:id', (req, res) => {
    database.getOrder(req)
        .then(data => {
            res.status(200);
            res.send(data);
        })
        .catch(error =>{
            res.status(404);
            res.send(error);
        });
});


router.get('/products', (req, res) => {
    database.getAllProducts()
        .then(data => {
            res.status(200);
            res.send(data);
        })
        .catch(error =>{
            res.status(404);
            res.send(error);
        });
});

router.get('/products/:id', (req, res) => {
    database.getProduct(req)
        .then(data => {
            res.status(200);
            res.send(data);
        })
        .catch(error =>{
            res.status(404);
            res.send(error);
        });
});

module.exports = router;