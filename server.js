const express = require('express');
const bodyParser = require('body-parser');
const decodeUriComponent = require('decode-uri-component');
const path = require('path');
const request = require('request');
const fs = require('fs');
const app = express();
var lang;
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
app.use(bodyParser.text());
app.post('/getLang', (req,res) => {
    lang = req.body.languagePicker;
    console.log('reallang'+lang);
    if(lang==="HTML/CSS")
        res.render('HTML_CSS');
    else
        res.render(lang);
    app.post('/getLang/run',(req,res) => {
        console.log('Server route running');
        var program = JSON.parse(JSON.stringify(req.body));
        var code = program.code;
        var stdin = program.stdin;
        //const code = req.body; // code 
        if(lang==='C++') // create languages id 
        {
            var language = "cpp";
        }
        else if(lang==='Java')
        {
            var language = 'java';
        }
        else if(lang==='Python')
        {
            var language = 'python2';
        }
        console.log(language);
        // request body to send to jdoodle
        const runRequestBody = {
            script: code,
            stdin:stdin,
            language: language,
            versionIndex:'0',
            clientId:'6d404c846ef58f0a957c5050f77eb09d',
            clientSecret:'7a6455151ce8ffb6b07742f9d58503482aebda9c1dc62212c857c2057180554e'
        };
        console.log(JSON.stringify(runRequestBody));
        
        request.post({
            url:'https://api.jdoodle.com/v1/execute',
            json:runRequestBody
        })
        .on('data', (data) => {
            // data is of Buffer type (array of bytes), need to be parsed to an object.
            const parsedData = JSON.parse(data.toString());
            if(parsedData.error) {
                //console.log(parsedData.error); 
                return res.status(400).send(parsedData);
            } else {
                //console.log(parsedData.output);
                return res.status(200).send(parsedData.output+'\n\n-----------------------------\n\n'+'CPU runtime: '+parsedData.cpuTime+" seconds");
            }
        })
        /*// change the code file name to the correct language 
        if(lang==='C++')
        {
            var newPath = path.join(__dirname,"public","CODE","code.cpp");
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
        // language switch //['-lstdc++']
        var compile = spawn('gcc', ['./public/CODE/code.cpp']);
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
        }) */
    })
    // Save button route
    app.post('/getLang/save',(req,res) => {
        var code = req.body;
        if(lang==='C++')
        {
            var Path = path.join(__dirname,"public","CODE","code.cpp");
        }
        else if(lang==='Java')
        {
            var Path = path.join(__dirname,"public","CODE","code.java");
        }
        else if(lang==='Python')
        {
            var Path = path.join(__dirname,"public","CODE","code.pyd");
        }
        fs.writeFile(Path,code,(err) => {
            if(err) throw err;
            
            console.log('File saved');
        });
        res.download('ChangeLog.txt',(err)=>{
            if(err) throw err;

            console.log('downloaded');
        });
    });

});
