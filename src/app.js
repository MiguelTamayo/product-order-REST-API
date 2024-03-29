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

//error handler
app.use((err, req, res, next) => {
    res.status(400);
    //bad json
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.json({error:"invalid json"});
    }
    //bad url
    else if(err instanceof URIError){
        res.json({error:"bad url"});
    }
    else{
        res.json({error:"undefined error"});
    }
});

//default response if route is not defined
app.use(function(req, res){
    res.status(404);
    res.json({error:"resource not found"});
});


app.listen(3000);