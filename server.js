const express = require('express');
const bodyParser = require('body-parser');
const decodeUriComponent = require('decode-uri-component');
const path = require('path');
const fs = require('fs');
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
    app.use(bodyParser.text());
    app.post('/getLang/run',(req,res) => {
        console.log('Server route running');
        const code = req.body; // code => still an object not yet a string
        const codePath = path.join(__dirname,"public","CODE","code.txt"); //   PROJECT/public/CODE/code.txt is created
        const stream = fs.createWriteStream(codePath); // create a write stream
        stream.write(code); // save the stringify object
        stream.end();
        console.log(code);

        // change the code file name to the correct language 
        if(lang==='C++')
        {
            var newPath = path.join(__dirname,"public","CODE","code.c");
        }
        else if(lang==='Javascript')
        {
            var newPath = path.join(__dirname,"public","CODE","code.js");
        }
        else if(lang==='Java')
        {
            var newPath = path.join(__dirname,"public","CODE","code.java");
        }
        else if(lang==='Python')
        {
            var newPath = path.join(__dirname,"public","CODE","code.pyd");
        }
        //Rename
        fs.rename(codePath,newPath,function(err) {
            if (err) throw err;

            console.log('File name changed');
        });

        // compile a file 
        var spawn = require('child_process').spawn;
        // language switch
        if(lang==='C++')
        {
            var compile = spawn('gcc', ['./public/CODE/code.c']);
        }
        else if(lang==='Java')
        {
            var compile = spawn('javac',['public/CODE/code.java']);
        }
        compile.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });
        compile.stderr.on('data', function (data) {
            console.log(String(data));
            res.send(data);
        });
        compile.on('close', function (data) {
            if (data === 0) {
                var run = spawn('./a.exe', []);
                run.stdout.on('data', function (output) {
                    console.log(String(output));
                    res.send(output);
                });
                run.stderr.on('data', function (output) {
                    console.log(String(output));
                    res.send(output);
                });
            } 
        }) 
    }) 
});
