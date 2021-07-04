var express = require("express");  
var path = require("path");  
var mongoose = require('mongoose');   
var bodyParser = require('body-parser');   
var morgan = require("morgan");  
var db = require("./config.js");  
var ejs = require('ejs');

var app = express();  
var port = process.env.port || 8888;  
var srcpath  =path.join(__dirname,'/public') ;  
app.use(express.static('public'));  
app.use(bodyParser.json());    
app.use(bodyParser.urlencoded({extended:true}));  
  
// Database Connectivity
var Schema = mongoose.Schema;  
var empSchema = new Schema({      
	//dropDups: true
    empid: { type: String, unique : true  },       
    empname: { type: String   },            
},{ versionKey: false });  
var model = mongoose.model('student', empSchema, 'student');  

app.get('/home', function (req, res) {  
   console.log("Got a GET request for the homepage");  
   res.send('<h1>Welcome to RIT</h1>');   
})

app.get('/about', function (req, res) {  
   console.log("Got a GET request for /about");  
   res.send('Dept. of Computer Science & Engineering');
})

//api for INSERT data from database  
app.post("/api/savedata",function(req,res){   
       
    var mod = new model(req.body);  
	req.body.serverMessage = "NodeJS replying to REACT"
	mod.save(function (err, result){                       
        if(err) 
		{ 
			console.log(err.message); 
			//res.send("Duplicate Student ID")
			res.json({
			status: 'fail'
		    })
		} 
		else
		{
            console.log('Student Inserted');
			/*Sending the respone back to the angular Client */
			res.json({
			msg: 'We received your data!!!(nodejs)',
			status: 'success',mydata:req.body
			})
		}
       })     
})  

 // get data from database DISPLAY  
 app.get('/display', function (req, res) { 
//------------- USING EMBEDDED JS -----------
 model.find().sort({empid:1}).exec(
 		function(err , i){
        if (err) return console.log(err)
        res.render('disp.ejs',{students: i})  
     })
//---------------------// sort({empid:-1}) for descending order -----------//
})

app.get('/delete.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "delete.html" );    
})

//api for Delete data from database  
app.get("/delete", function(req, res) {
	//var empidnum=parseInt(req.query.empid)  // if empid is an integer
	var empidnum=req.query.empid;
	
        model.findOneAndDelete({"empid":empidnum},function(err, obj){
				if (err) {
					res.send(err);
					console.log("Failed to remove data.");
			} else {
				// console.log("deleted");
				// if (obj.result.n)
				// {
				res.send("Student Deleted");
				console.log("Student Deleted")
				// }
				// else
				// 	res.send("Student Not Found")
			}
        });
  })
  
  
//Update data from database  
app.get('/update.html', function (req, res) {
    res.sendFile( __dirname + "/" + "update.html" );
})

app.get("/update", function(req, res) {
	var empname1=req.query.empname1;
	var empname2=req.query.empname2;
	
   	model.findOneAndUpdate({"empname":empname1},{"empname":empname2},{multi:true},   
    function(err,obj) {  
     if (err) {  
        res.send(err);
       console.log("Failed to updated data") 
      }
      else 
     {
      if (obj==null)
       {  res.send("Student Not Found") }
     else
      {
	    res.send("<br/>"+empname1+":"+"<b>Emplyee Name Updated</b>");
	   console.log("Student Updated")
       }
     }
 });	
})	

//--------------SEARCH------------------------------------------
app.get('/search.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "search.html" );    
})

app.get("/search", function(req, res) {
	//var empidnum=parseInt(req.query.empid)  // if empid is an integer
	var empidnum=req.query.empid;
	model.find({empid: empidnum},{empname:1,empid:1,_id:0}).exec(function(err, docs) {
    if (err) {
      console.log(err.message+ "Failed to get data.");
    } else
	{
	if (docs=='')
		res.send("<br/>"+empidnum+":"+"<b>Emplyee Not Found</b>")
	else
	    res.status(200).json(docs);
	}
  });
  })  
  
// call by default index.html page  
app.get("*",function(req,res){   
    res.sendFile(srcpath +'/index.html');  
})   
//server stat on given port  
app.listen(port,function(){   
    console.log("server start on port:"+ port);  
})  