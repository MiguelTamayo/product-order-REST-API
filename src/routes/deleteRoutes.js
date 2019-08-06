const express = require('express');
const router = express.Router();
const database = require('../databaseConnection/database.js');

router.delete('/products', (req, res) => {
    database.deleteAllProducts()
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
    database.deleteProduct(req.params.id)
        .then(data => {
            res.status(200);
            res.json(data);
        })
        .catch(error =>{
            if(error instanceof Error){
                res.status(500);
                res.json({error:"server error"});
            }else {
                res.status(404);
                res.json(error);
            }
        });
});

router.delete('/orders', (req, res) => {
    database.deleteAllOrders()
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
    database.deleteOrder(req.params.id)
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