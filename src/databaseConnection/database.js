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

Database.createProduct = function(request){
    return new Promise((resolve, reject) => {
        let product = request.body;

        //verify json object contains the right properties
        if((product.name  === undefined)||(product.price === undefined)){
            return reject({error:"json data sent did not contain the correct properties of 'name' and/or 'price'"});
        }
        //verify properties are of correct type/value
        else if(typeof product.price !== "number"){
            return reject({error:"product price is not a number"});
        }
        else if(product.name.length > 25){
            return reject({error:"product name is too long, must be less than or equal to 25 characters"});
        }
        //price cannot be negative or be too big
        else if((product.price < 0) || (false)){
            return reject({error:"invalid price amount"});
        }
        //end of checks for request data

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
                                        console.log("connection destroyed");
                                        conn.destroy();
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
                                        console.log("connection destroyed");
                                        conn.destroy();
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

module.exports = Database;