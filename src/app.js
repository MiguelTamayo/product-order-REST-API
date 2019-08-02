const postRoutes = require('./routes/postRoutes.js');
const getRoutes = require('./routes/getRoutes.js');
const deleteRoutes = require('./routes/deleteRoutes.js');
const express = require('express');
const app = express();


//middleware
app.use(express.json());

app.use('/', postRoutes);
app.use('/', getRoutes);
app.use('/', deleteRoutes);

//default response if route is not defined
app.use(function(req, res){
    res.status(404);
    res.json({result:"not found"});
});

app.listen(3000);