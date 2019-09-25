const express = require('express');
const bodyParser = require('body-parser');
const decodeUriComponent = require('decode-uri-component');
const path = require('path');
const request = require('request');
const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const app = express();
var lang;
// Database create    //  localURL:  mongodb://localhost:27017/myapp
var DBurl = 'mongodb://localhost:27017/myapp' /*process.env.MONGODB_URI*/ //'mongodb+srv://son:siliconvalley@cluster0-omoxa.mongodb.net/test?retryWrites=true&w=majority';
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
var ProgramSchema = new mongoose.Schema ({
    language: {
        type:String,
        required:true
    },
    code: {
        type:String
    },
    user:{type:Schema.Types.ObjectId,ref:'User'}
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
    },
    program:[{type:Schema.Types.ObjectId,ref:'Program'}]
    ,
});
var User = mongoose.model('User',UserSchema);
var Program = mongoose.model('Program',ProgramSchema);
module.exports = User;
module.exports = Program;
/* UserSchema.methods.nextProgram = function nextProgram(lang,cb) {
    
}; */
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
 //* TESTING ONLY
/* var sonnguyen = new User ({
    email: 'nguyennhatson1810@gmail.com',
    username:'zaz',
    password:'821410'
});
User.find(function(err,users){
    if (err) throw err;

    console.log(users);
}) */
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
    .populate('program')
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
                {
                    Program.findOne({user:req.session.userId,language:lang})
                    .exec(function(err,program){
                        if(err) throw err;

                        if(program==null) // IF USER HAVENT GOT ANY PROGRAM
                        {
                            const A = new Program({
                                _id:Schema.Types.ObjectId,
                                language:lang,
                                code:'TESTINGTHOINHE',
                                user:user._id
                            })
                            A.save();
                            req.session.programId = A._id;
                            res.render(lang,{uname:user.username,code:A.code});
                        }
                        else
                        {

                            req.session.programId = program._id;
                            res.render(lang,{uname: user.username,code:program.code});
                        }                     
                    });
                    //res.render(lang,{uname: user.username});
                }
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
    })
    // Save button route
    app.post('/getLang/save',(req,res) => {
        console.log('worked');
 /*        var code = req.body;
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
        //res.status(200).send('Yup'); 
        User.findById(req.session.userId)
        .exec(function(e,user){
            if(e) return next(err);

            else
            {
                console.log(user.program[0]);
            }
        });
    });
});
app.use(bodyParser.text());
app.post('/codePush',(req,res)=>{
    //console.log(req.body);
    if(req.session.programId)   
    {
        Program.findById(req.session.programId)
        .populate('user')
        .exec(function(err,program) {
            if (err) throw err;

            else
            {
                program.lang = lang;
                program.code = req.body;    
            }
        });
    }
    else
    {
        return;
        /* if(req.session.userId)
        {
            User.findById(req.session.userId)
            .exec(function(err,user){
                if (err) throw err;
                else
                {
                    if(user==null)
                        return;//codepush only for logged in user
                    else
                    {
                        user.save(function(err){
                            if(err) throw err;
                            else
                            {
                                const program2 = new Program({
                                    language:lang,
                                    code:req.body,
                                    user:user._id
                                })
                                program2.save();
                            }
                        });
                    }
                }
            });
        }
        else
            return; */
    }
        /* User.findById(req.session.userId)
        .exec(function(err,user){
            if(err) console.log(err);

            else
            { 
                user.save(function(e) {
                    var program1 = new Program({
                        language:lang,
                        code: req.body,
                        user:user._id
                        });
                        program1.save(function(err){
                            if (err) console.log(err) ;
                        })
                });
            }
        }); */
            //if (err) return next(err);

            //else
            //{
                /* var m = mongoose.model('Program',Program);
                var program1 = new m;
                program1.language = lang;
                program1.code = req.body; 
                var program1 = {
                    "language":lang,
                    "code": req.body
                };
                console.log(JSON.stringify(program1));
                /* User.aggregate([
                    {$match:{_id:req.session.userId}},
                    {$addFields:{program:{$concatArrrays:["$program",[program1]]}}}
                ]) */

                //User.update({_id:req.session.userId},{$push:{program:{"language":lang,"code":req.body}}});

                //User.findOneAndUpdate({_id:req.session.userId}, {$push: {program:{"Program.language":lang,"Program.code":req.body}}});


               /*  User.update(
                    {_id:req.session.userId},
                    {$push:{program: program1}}
                ) */
                //res.end();
            //}
        //})
    
})

