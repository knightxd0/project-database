var express = require('express')
var cors = require('cors')
var app = express()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

const bcrypt = require('bcrypt');
const salRounds = 10;   //value hash password

var jwt = require('jsonwebtoken')
const secret = 'home-help-login';

app.use(cors())

//connect database
const mysql = require('mysql2');

const condb = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'projectdatabase'
});



app.post('/register', jsonParser ,function(req, res, next){
    console.log(req.body.email, req.body.password ,req.body.fname ,req.body.lname,req.body.status)
    bcrypt.hash(req.body.password, salRounds, function(err, hash){
        condb.execute('INSERT INTO users (email, password, fname, lname, status) VALUES (?,?,?,?,?)',[req.body.email, hash ,req.body.fname ,req.body.lname,req.body.status],
        function(err, results, fields){
            if(err){
                res.json({status: 'error', message: err})
                return
            }
            res.json({status: 'ok'})

        }
    );
    })
    
})

app.post('/deleteaccount', jsonParser,function(req,res,next){
    condb.execute('DELETE FROM users WHERE token = ?',[req.headers.token],
        function(err,user,field){
            if(err){
                res.json({status: 'error', message: err})
                return
            }
            if(user.length == 0){
                res.json({status: 'error', message: 'no user found'})
                return
            }
            res.json({status: 'ok'})
        }
    )
})

app.post('/deleteaddress', jsonParser,function(req,res,next){
    condb.execute('DELETE FROM address WHERE id = ?',[req.headers.id],
        function(err,user,field){
            if(err){
                res.json({status: 'error', message: err})
                return
            }
            if(user.length == 0){
                res.json({status: 'error', message: 'no user found'})
                return
            }
            res.json({status: 'ok'})
        }
    )
})


app.post('/login', jsonParser,function(req, res, next){
    condb.execute('SELECT * FROM users WHERE email = ?',[req.body.email],
        function(err, users, fields){
            if(err){
                res.json({status: 'error', message: err})
                return
            }
            if(users.length == 0){
                res.json({status: 'error', message: 'no user found'})
                return
            }
            bcrypt.compare(req.body.password,users[0].password,function(err,isLogin){
                if(isLogin){
                    var token = jwt.sign({email: users[0].email},secret);
                    condb.execute('UPDATE users SET token = ? WHERE email = ?',[token,req.body.email])
                    res.json({status:users[0].status, message: 'login success', user: users[0].fname,token})

                }else{
                    res.json({status:'error', message: 'login fail'})

                }
            });
          

        }
    )
})

app.post('/insertaddress',jsonParser, function(req,res,next){
    condb.execute('INSERT INTO address (user, namehome, type, addr, province, amphor, tambon) VALUES (?,?,?,?,?,?,?)',[req.body.user,req.body.nameh,req.body.type,req.body.addr,req.body.province,req.body.amphor,req.body.tambon],
        function(err, address, fields){
            if(err){
                res.json({status: 'error', message: err})
                return
            }
            res.json({status: 'ok',data: address});
        }
    )
})

app.post('/shownaddress',jsonParser, function(req,res,next){
    condb.execute('SELECT * FROM address WHERE user = ?',[req.body.user],
        function(err,address,field){
            if(err){
                res.json({status: 'error', message: err})
                return
            }
            res.json({status: 'ok',data: address});
        }
    )
})

app.post('/updateProfile', jsonParser, function(req,res,next){
    condb.execute('UPDATE users SET fname = ?,lname = ?,phone = ? WHERE token = ?',[req.body.firstname,req.body.lastname,req.body.phonenumber,req.body.token],
        function(err,user,field){
            if(err){
                res.json({status: 'error', message: err})
                return
            }
            if(user.length == 0){
                res.json({status: 'error', message: 'no user found'})
                return
            }
            res.json({status: 'ok'})
        }
    )
})

app.post('/showbookingnotworking',jsonParser, function(req,res,next){
    condb.execute('SELECT * FROM booking WHERE statuswork = "ยังไม่ได้ดำเนินการ" AND email = ?',[req.body.email],
        function(err,booking,field){
            if(err){
                res.json({status: 'error', message: err})
                return
            }
            res.json({status: 'ok',data: booking});
        }
    )
})

app.post('/showbookingnotworkings',jsonParser, function(req,res,next){
    condb.execute('SELECT * FROM booking WHERE statuswork = "ยังไม่ได้ดำเนินการ" AND email = ?',[req.body.email],
        function(err,booking,field){
            if(err){
                res.json({status: 'error', message: err})
                return
            }
            res.json({status: 'ok',data: booking});
        }
    )
})

app.post('/showbookingcomplete',jsonParser, function(req,res,next){
    condb.execute('SELECT * FROM booking WHERE statuswork = "ดำเนินการเสร็จสิ้น" AND nameemp = ?',[req.body.nameemp],
        function(err,booking,field){
            if(err){
                res.json({status: 'error', message: err})
                return
            }
            res.json({status: 'ok',data: booking});
        }
    )
})

app.post('/showhistory',jsonParser, function(req,res,next){
    condb.execute('SELECT * FROM history WHERE user = ?',[req.body.id],
        function(err,history,field){
            if(err){
                res.json({status: 'error', message: err})
                return
            }
            res.json({status: 'ok',data: history});
        }
    )
})

app.post('/authen', jsonParser , function(req,res,next){
   
    condb.execute('SELECT * FROM users WHERE token = ?',[req.headers.token],
        function(err,user,field){
            if(err){
                res.json({status: 'error', message: err})
               
                return
            }
            if(user.length == 0){
                res.json({status: 'error', message: 'no user found'})
               
                return
            }

            try{
                const token = req.headers.authorization.split(' ')[1]
                var decoder = jwt.verify(token,secret);
                res.json({status:'ok',user: user[0].fname,lastname: user[0].lname,Phonnumber: user[0].phone,email: user[0].email,type: user[0].status,decoder})
            }catch(err){
                res.json({status:'error',message: err.message})
               
            }
        }

        
    ) 
})

app.post('/jobservice',jsonParser,function(req,res,next){
    condb.execute('SELECT * FROM jobservice WHERE info = ?',[req.headers.info],
        function(err,job,field){
            if(err){
                res.json({status: 'error', message: err})
               
                return
            }
            if(job.length == 0){
                res.json({status: 'error', message: 'no user found'})
               
                return
            }
            res.json({status:'ok',jobservices: job})
        }
    )
})

app.post('/jobservice',jsonParser,function(req,res,next){
    condb.execute('SELECT * FROM jobservice WHERE info = ?',[req.headers.info],
        function(err,job,field){
            if(err){
                res.json({status: 'error', message: err})
               
                return
            }
            if(job.length == 0){
                res.json({status: 'error', message: 'no user found'})
               
                return
            }
            res.json({status:'ok',jobservices: job})
        }
    )
})

app.post('/showjob',jsonParser,function(req,res,next){
    condb.execute('SELECT * FROM jobservice WHERE email = ?',[req.body.email],
        function(err,job,field){
            if(err){
                res.json({status: 'error', message: err})
               
                return
            }
            if(job.length == 0){
                res.json({status: 'error', message: 'no user found'})
               
                return
            }
            res.json({status:'ok',jobservices: job})
        }
    )
})


app.post('/insertbooking',jsonParser,function(req,res,next){
    condb.execute('INSERT INTO booking (nameService,nameemp,payment,province,type,numhr,date,time,statuswork,idservice) VALUES (?,?,?,?,?,?,?,?,?,?)',[req.body.nameService, req.body.nameemp,  req.body.payment, req.body.province, req.body.type, req.body.numhr, req.body.date, req.body.time, req.body.statuswork, req.body.idservice],
        function(err,inbook,field){
            if(err){
                res.json({status: 'error', message: err})
               
                return
            }
            
            res.json({status:'ok',inbook: inbook})
        }
    )
})

app.post('/updatebooking',jsonParser,function(req,res,next){
    condb.execute('UPDATE booking SET status = ?,email = ? WHERE idservice = ? ',[req.body.status,req.body.email,req.body.idservice],
    function(err,upbook,field){
        if(err){
            res.json({status: 'error', message: err})
           
            return
        }
        
        res.json({status:'ok',upbook: upbook})
    }
    )
})



app.listen(3000, function(){
    console.log('cors-enable webserver')
})