const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));  // CSS use 
const server = app.listen(1111,()=> {
    console.log(`Express running -> PORT ${server.address().port}`);
})
app.set('view engine','pug');
app.get('/',(req,res) => {
    res.render('HTML');
})