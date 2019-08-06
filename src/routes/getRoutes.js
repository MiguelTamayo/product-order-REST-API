const express = require('express');
const router = express.Router();
const database = require('../databaseConnection/database.js');


router.get('/orders', (req, res) => {
    database.getAllOrders()
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

router.get('/orders/:id', (req, res) => {
    database.getOrder(req.params.id)
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
    database.getProduct(req.params.id)
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