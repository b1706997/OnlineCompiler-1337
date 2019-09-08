const express = require('express');
const bodyParser = require('body-parser');
const decodeUriComponent = require('decode-uri-component');
const path = require('path');
const request = require('request');
const fs = require('fs');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const app = express();
var lang;
// Database create    //  localURL:  mongodb://localhost:27017/myapp
var DBurl = process.env.MONGODB_URI //'mongodb+srv://son:siliconvalley@cluster0-omoxa.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(DBurl, {useNewUrlParser: true});
var db = mongoose.connection;
//Session
app.use(session({
    secret: 'workhard',
    resave: true,
    saveUninitialized: false,
    cookie: {maxAge:60000},
    store: new MongoStore({
        mongooseConnection: db
      })
  }));
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Database connected');
  // we're connected!
});
var UserSchema = new mongoose.Schema ({
    email: {
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    username: {
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    password: {
        type:String,
        required:true,
    }
    ,
});
/*UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email })
      .exec(function (err, user) {
        if (err) {
          return callback(err)
        } else if (!user) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password, function (err, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        })
      });
  }*/
  
  /*//hashing a password before saving it to the database
  UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    })
  });*/
var User = mongoose.model('User',UserSchema);
module.exports = User;
/* TESTING ONLY
var sonnguyen = new User ({
    email: 'nguyennhatson1810@gmail.com',
    username:'zaz',
    password:'821410'
});

User.find(function(err,users){
    if (err) throw err;

    console.log(users);
})*/
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
    User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          return res.render('index');
        } else {
           return res.render('index', { uname : user.username });
        }
      }
    });
});
//app.use(bodyParser.text());
// SIGNUP ROUTE
app.post('/SignUp', (req,res) => {
    sessData = req.session;
    User.findOne({$or:[{username:req.body.uname},{email:req.body.email}]},function(err,result){
        if(err) throw err;
        if(result==null)
        {
            var userData = {
                username:req.body.uname,
                password:req.body.psw,
                email:req.body.email
            }
            User.create(userData,function(err,user) {
                if (err) 
                    throw err;
                console.log('account: '+userData.username+' created');
                req.session.userId = user._id;
                return res.redirect(req.baseUrl+'/');
            })
        }
        else
        {
            User.findOne({username:req.body.uname},function(err,result){
                if(result==null)
                {
                    res.status(300).send('Email already exists');
                }
                else
                {
                    res.status(301).send('Username already exists');
                }
            })
        }
    })
});
app.post('/Login',(req,res)=>{
    User.findOne({$and:[{username:req.body.uname},{password:req.body.psw}]},function(err,result){
        if(err) throw err;

        if(result==null)
            return res.status(400).send('Invalid username or password');  
        else
        {
            console.log(result.username+' logged in');
            req.session.userId = result._id;
            return res.sendStatus(200);
        }
    })
});
app.get('/Logout',(req,res)=>{
    if(req.session)
    {
        req.session.destroy(function(err) {
            if(err) 
                throw err;
            else
                return res.sendStatus(200);
        });
    }
})
app.post('/getLang', (req,res) => {
    lang = req.body.languagePicker;
    //check if logged in or not
    User.findById(req.session.userId)
    .exec(function(err,user) {
        if (err) return next(err)

        else 
            if(user==null)
            {
                if(lang==="HTML/CSS")
                    res.render('HTML_CSS');
                else
                    res.render(lang);
            }
            else 
            {
                if(lang=='HTML/CSS')
                    res.render('HTML_CSS',{uname: user.username});
                else
                    res.render(lang,{uname: user.username});
            }
    })
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
        /*res.download('ChangeLog.txt',(err)=>{
            if(err) throw err;

            console.log('downloaded');
        });*/
        res.status(200).send('Yup');
    });
});

