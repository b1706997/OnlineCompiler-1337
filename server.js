const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(express.static(__dirname + '/public'));  // CSS use 
const server = app.listen(process.env.PORT || 1111,err => {
	if(err) throw err;
	
    console.log(`Express running -> PORT ${server.address().port}`);
});
app.use(bodyParser.urlencoded({  // parse req body 
    extended: true
  }));
app.set('view engine','pug');
app.set("views", path.join(__dirname, "views"));
app.get('/',(req,res) => {
    res.render('index');
});
app.post('/getLang', (req,res) => {
    const lang = req.body.languagePicker;
    if(lang==="HTML/CSS")
        res.render('HTML_CSS');
    else
        res.render(lang);
});
