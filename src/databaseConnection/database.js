const mariaDB = require('mariadb');
let Database = {};

/*
const poolConnectionOptions = {
    user: 'USER',
    password:'PASSWORD',
    host: 'HOST',
    port: PORT,
    database: 'DATABASE',
    connectionLimit: 5
};
*/

const poolConnectionOptions = {
    user: 'USER',
    password:'PASSWORD',
    host: 'HOST',
    port: PORT,
    database: 'DATABASE',
    connectionLimit: 5
};

let pool = mariaDB.createPool(poolConnectionOptions);

function productIntegrityCheck(product){
    //verify json object contains the right properties
    if((product.name  === undefined)||(product.price === undefined)){
        return {error:"product data sent did not contain the correct properties of 'name' and/or 'price'"};
    }
    //verify properties are of correct type/value
    else if(typeof product.price !== "number"){
        return {error:"product price is not a number"};
    }
    else if(product.name.length > 25){
        return {error:"product name is too long, must be less than or equal to 25 characters"};
    }
    //price cannot be negative or be too big
    else if((product.price < 0) || (false)){
        return {error:"invalid price amount"};
    }

    //product integrity is good
    return true;
}

function productOrderIntegrity(product, index){
    return new Promise((resolve, reject) => {
        //check if product has quantity
        if(product.quantity === undefined){
            reject({error:"product does not have 'quantity' property @ index: "+index});
        }
        //check if product quantity is integer
        else if(typeof product.quantity !== "number"){
            reject({error:"product quantity was not an number @ index: "+index});
        }
        else if(!Number.isInteger(product.quantity)){
            reject({error:"product quantity was not an integer @ index: "+index});
        }
        //check if product has id property
        else if(product.id === undefined){
            reject({error:"product does not have an 'id' property @ index: "+index});
        }
        //check if product id is integer
        else if(typeof product.id !== "number"){
            reject({error:"product id was not an number @ index: "+index});
        }
        else if(!Number.isInteger(product.id)){
            reject({error:"product id was not an integer @ index: "+index});
        }else{
            //check if product id exists in database

            //use prepared statement
            let sql = "SELECT * FROM `products` WHERE `id` = ?;";
            pool.getConnection()
                .then(conn => {
                    conn.query(sql,[product.id])
                        .then(result=>{
                            if(result[0] === undefined){
                                console.log("product id does not exist");
                                reject({error:"product id does not exist @ index: "+index});
                            }else{
                                resolve();
                            }
                        })
                        .catch(()=>{
                            console.log("error with query");
                            reject({error:"could not create order"});
                        })
                        .finally(()=>{
                            conn.release();
                        });
                })
                .catch(()=>{
                    reject({error:"could not create order"});
                });
        }
    });
}

Database.createProduct = function(request){
    return new Promise((resolve, reject) => {
        let product = request.body;

        //product data check
        const productIntegrity = productIntegrityCheck(product);
        if(productIntegrity !== true) {
            return reject(productIntegrity);
        }

        //start database action
        pool.getConnection()
            .then(conn=>{
                conn.beginTransaction()
                    .then(()=>{
                        //use prepared statement
                        let sql = "INSERT INTO `products` (`name`, `price`) VALUES (?, ?);";
                        conn.query(sql, [product.name, product.price])
                            .then(results =>{
                                console.log("sql went through");
                                conn.commit()
                                    .then(()=>{
                                        console.log("transaction committed");
                                        return resolve({result: "product created! new product id is: "+results.insertId});
                                    })
                                    .catch((err)=>{
                                        console.log("error with committing transaction");
                                        console.log(err);
                                        return reject({error:"could not create product"});
                                    })
                                    .finally(()=>{
                                        console.log("connection released");
                                        conn.release();
                                    });
                            })
                            .catch(()=>{
                                console.log("error with query");
                                conn.rollback()
                                    .then(()=>{
                                        console.log("rolled-back transaction");
                                    })
                                    .catch(()=>{
                                        console.log("error in roll back");
                                    })
                                    .finally(()=>{
                                        console.log("connection released");
                                        conn.release();
                                        return reject({error:"could not create product"});
                                    });
                            });
                    })
                    .catch(()=>{
                        console.log("error with transaction");
                        return reject({error:"could not create product"});
                    })
            })
            .catch(err=>{
                console.log("error with connection");
                return reject({error:"could not create product"});
            })
    });
};

Database.createOrder = function(request){
    return new Promise((resolve, reject) => {

        let order = request.body;

        //check if order contains products property
        if(order.products === undefined){
            return reject({error:"order data sent did not contain the property of 'products'"});
        }
        //check if products property is an array
        if(!(order.products instanceof Array)){
            return reject({error:"order 'products' property was not an array"});
        }
        //check if products array is not empty
        if(order.products.length === 0){
            return reject({error:"order 'products' property was empty"});
        }
        //check if all products in order have the correct properties
        //check if all products properties are of the correct type and value
        let productPromises = [];
        for(let i = order.products.length-1; i >= 0; i--){
            let product = order.products[i];
            //product data check
            productPromises.push(productOrderIntegrity(product, i));
        }

        Promise.all(productPromises)
            .then(()=>{
                let orderID = undefined;
                const date = Date.now();
                pool.query("SELECT UUID();")
                    .then(result => {
                        orderID = result[0]['UUID()'];
                        pool.getConnection()
                            .then(conn=>{
                                conn.beginTransaction()
                                    .then(()=>{
                                        let queryPromises = [];
                                        for(let i = order.products.length-1; i >= 0; i--){
                                            let product = order.products[i];
                                            //use prepared statement
                                            let sql = "INSERT INTO `orders` (`order_id`, `product_id`, `quantity`, `date_placed`) VALUES (?, ?, ?, ?);";
                                            queryPromises.push(conn.query(sql, [orderID, product.id, product.quantity, date]));
                                        }
                                        Promise.all(queryPromises)
                                            .then(()=>{
                                                conn.commit()
                                                    .then(()=>{
                                                        console.log("transaction committed");
                                                        return resolve({result: "order created! new order id is: "+orderID});
                                                    })
                                                    .catch((err)=>{
                                                        console.log("error with committing transaction");
                                                        console.log(err);
                                                        return reject({error:"could not create order"});
                                                    })
                                                    .finally(()=>{
                                                        console.log("connection released");
                                                        conn.release();
                                                    });
                                            })
                                            .catch(()=>{
                                                conn.rollback()
                                                    .then(()=>{
                                                        console.log("rolled-back transaction");
                                                    })
                                                    .catch(()=>{
                                                        console.log("error in roll back");
                                                    })
                                                    .finally(()=>{
                                                        console.log("connection released");
                                                        conn.release();
                                                        return reject({error:"could not create order"});
                                                    });
                                            });
                                    })
                                    .catch(()=>{
                                        console.log("error with transaction");
                                        return reject({error:"could not create order"});
                                    })
                            })
                            .catch(err=>{
                                console.log("error with connection");
                                return reject({error:"could not create order"});
                            })
                    })
                    .catch(error => {
                        reject(new Error("error with db"))
                    });
            })
            .catch(error=>{
                return reject(error);
            });
    });
};

Database.getAllOrders = function(){
    return new Promise((resolve, reject) => {
        pool.getConnection()
            .then(conn => {
                const sql = "SELECT `order_id`, `product_id`, `quantity`, `date_placed` FROM `orders`;";
                conn.query(sql)
                    .then(results =>{
                        resolve(results);
                    })
                    .catch(()=>{
                        console.log("error with query");
                        reject(new Error("query to db failed"))
                    })
                    .finally(()=>{
                        conn.release();
                    })
            })
            .catch(error => {
               console.log("could not get connection to database");
               reject(new Error("connection to db failed"));
            });
    });
};

Database.getOrder = function(id){
    return new Promise((resolve, reject) => {
        pool.getConnection()
            .then(conn => {
                //use prepared statement
                const sql = "SELECT `order_id`, `product_id`, `quantity`, `date_placed` FROM `orders` WHERE `order_id` = ?;";
                conn.query(sql, [id])
                    .then(results =>{
                        resolve(results);
                    })
                    .catch(()=>{
                        console.log("error with query");
                        reject(new Error("query to db failed"))
                    })
                    .finally(()=>{
                        conn.release();
                    })
            })
            .catch(error => {
                console.log("could not get connection to database");
                reject(new Error("connection to db failed"));
            });
    });
};

Database.getAllProducts = function(){
    return new Promise((resolve, reject) => {
        pool.getConnection()
            .then(conn => {
                const sql = "SELECT * FROM `products`;";
                conn.query(sql)
                    .then(results =>{
                        resolve(results);
                    })
                    .catch(()=>{
                        console.log("error with query");
                        reject(new Error("query to db failed"))
                    })
                    .finally(()=>{
                        conn.release();
                    })
            })
            .catch(error => {
                console.log("could not get connection to database");
                reject(new Error("connection to db failed"));
            });
    });
};

Database.getProduct = function(id){
    return new Promise((resolve, reject) => {
        id = Number(id);
        if(typeof id !== "number"){
            return reject({error:"id was not a number"})
        }else if(!(Number.isInteger(id))){
            return reject({error:"id was not an integer"})
        }

        pool.getConnection()
            .then(conn => {
                //use prepared statement
                const sql = "SELECT * FROM `products` WHERE `id` = ?;";
                conn.query(sql, [id])
                    .then(results =>{
                        resolve(results);
                    })
                    .catch(()=>{
                        console.log("error with query");
                        reject(new Error("query to db failed"))
                    })
                    .finally(()=>{
                        conn.release();
                    })
            })
            .catch(error => {
                console.log("could not get connection to database");
                reject(new Error("connection to db failed"));
            });
    });
};

module.exports = Database;