const express = require('express');

const app = express();

const PORT = process.env.PORT || 8888;

app.get('/',  (req, res)=>{
    res.send("App is running")
})

app.listen(PORT, () =>{
    console.log(`Server is listening on Port: -> ${PORT}`);
})