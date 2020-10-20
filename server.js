const express = require('express');
const connectDB = require('./config/db');

const app = express();

connectDB();
const PORT = process.env.PORT || 8888;

app.get('/',  (req, res)=>res.send("App is running"))

/**
 * @Routes 
 */

app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/posts', require('./routes/api/posts'))
app.use('/api/profile', require('./routes/api/profile'))

app.listen(PORT, () =>{
    console.log(`Server is listening on Port: -> ${PORT}`);
})