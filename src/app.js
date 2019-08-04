const postRoutes = require('./routes/postRoutes.js');
const getRoutes = require('./routes/getRoutes.js');
const deleteRoutes = require('./routes/deleteRoutes.js');
const express = require('express');
const app = express();

//middleware
app.use(express.json());
//express json parser error middleware
app.use((err, req, res, next) => {
    res.status(400);
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.json({error:"invalid json"});
    }else{
        res.json({error:"undefined error"});
    }
});

app.use('/', postRoutes);
app.use('/', getRoutes);
app.use('/', deleteRoutes);

//default response if route is not defined
app.use(function(req, res){
    res.status(404);
    res.json({error:"resource not found"});
});

app.listen(3000);