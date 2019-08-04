const express = require('express');
const router = express.Router();
const database = require('../databaseConnection/database.js');

//router middleware
router.use((req, res, next) => {
    //check if content header is json
    if( !req.is('application/json') ){
        res.json({error:"'Content-Type' header is not 'application/json'"});
    }else{
        next();
    }
});

router.post('/products', (req, res) => {
    database.createProduct(req)
        .then(data => {
            res.status(201);
            res.json(data);
        })
        .catch(error =>{
            if(error instanceof Error){
                res.status(500);
                res.json({error:"server error"});
            }else {
                res.status(400);
                res.json(error);
            }
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