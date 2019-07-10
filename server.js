const express = require('express');
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
app.get('/',(req,res) => {
    res.render('HTML');
});