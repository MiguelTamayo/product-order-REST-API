const express = require('express');
const router = express.Router();
const database = require('../databaseConnection/database.js');

router.delete('/products', (req, res) => {
    database.deleteAllProducts(req)
        .then(data => {
            res.status(200);
            res.send(data);
        })
        .catch(error =>{
            res.status(404);
            res.send(error);
        });
});

router.delete('/products/:id', (req, res) => {
    database.deleteProduct(req)
        .then(data => {
            res.status(200);
            res.send(data);
        })
        .catch(error =>{
            res.status(404);
            res.send(error);
        });
});

router.delete('/orders', (req, res) => {
    database.deleteAllOrders(req)
        .then(data => {
            res.status(200);
            res.send(data);
        })
        .catch(error =>{
            res.status(404);
            res.send(error);
        });
});

router.delete('/orders/:id', (req, res) => {
    database.deleteOrder(req)
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