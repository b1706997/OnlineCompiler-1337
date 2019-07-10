const express = require('express');
const path = require('path');
const app = express();
const pug = {
  test: /\.pug$/,
  use: ['html-loader?attrs=false', 'pug-html-loader']
};
app.use(express.static(__dirname + '/public'));  // CSS use 
const server = app.listen(process.env.PORT || 1111,err => {
	if(err) throw err;
	
    console.log(`Express running -> PORT ${server.address().port}`);
});
app.set('view engine','pug');
app.set("views", path.join(__dirname, "views"));
app.get('/',(req,res) => {
    res.render('HTML');
});