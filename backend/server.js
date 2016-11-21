var schedule = require('./app.js');
var express = require('express');
var fs = require('fs');
var cors = require('cors')

//var class_list = JSON.parse(fs.readFileSync('../classes.json', 'utf8'));
//var students_list = JSON.parse(fs.readFileSync('../studentsByAvailability.json', 'utf8'));
var json_result = schedule.get_result();

var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());
var PORT = process.env.PORT || 3000;

app.listen(PORT, function(){
	console.log("app is listening on port "+PORT);
});

app.get('/data', function(req, res){
	
	res.json(json_result);
	console.log(json_result);
});


app.post('/login', function(req, res){
	var input_name = req.body.NAME;
	var student_name = [];
	var class_name = [];
	for(var id in students_list) {
		student_name.push(students_list[id][0].replace(/\s/g, ''));}
	for(var id in class_list["classes"]) {
		class_name.push(class_list["classes"][id]["name"].replace(/\s/g, ''));}
	
	if(student_name.indexOf(input_name) > -1) {
		res.send("Student Login");
	} else if(class_name.indexOf(input_name) > -1) {
		res.send("Professor Login");
	} else if(input_name == "principle") {
		res.send("Principle Login");
	} else {
		res.send("Error: NO SUCH USER");
	}
//	console.log(input_name);
//	res.json(class_name);
});

