const mongoose = require('mongoose');

const config = require('config');

const db = config.get('mongoURI')

const connectDB = async () =>{
    try{
        await mongoose.connect(db,{
            useUnifiedTopology:true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        console.log("Database is connected...")
        
    }catch(err){

        console.log(err.message);
        // if error exit the process
        process.exit(1)
    }
}
module.exports = connectDB;