var student_name = [];
var class_name = [];

function initial() {
	getData();
	angularApp();
	
	$("#login").on("click", login);
}

function angularApp() {
	var app = angular.module('myApp', ['ngRoute']);

	app.controller('myCtrl', function($scope) {
	    $scope.username = '';
	    
	    $scope.infoMessageHandler = function(){
	        if(findName($scope.username) == 'Principal' ){
	            return 'Hi Principal!';
	        }else if(findName($scope.username) == 'Student'){
	            return 'Hi Student!';
	        }else if(findName($scope.username) == 'Professor'){
	            return 'Hi Professor!';
	        } else if ($scope.username != ''){
	        		return "Username not found!";
	        }
//	        console.log($scope.username);
	    }
	    
	});
}

function login() {
	var NAME = $("#lg_username").val();
//	$("#usernameError").text("");
	
	if(findName(NAME) == "Student") {
		var studentID = student_name.indexOf(NAME.replace(/[,\s]/g, '')) + 1;
		localStorage.setItem("studentID", studentID.toString());
		window.location.href = "schedule.html";
	} else if(findName(NAME) == "Professor") {
		localStorage.setItem("className", capitalizeFirstLetter(NAME));
		window.location.href = "prof.html";
	} else if(findName(NAME) == "Principal") {
		window.location.href = "principalHome.html";
	} else {
//		$("#usernameError").text("Username not found");
	}
	
}

function getData() {
	var allData = {};
	$.ajax({
		type:"get",
		url:"http://codejamteam24api.herokuapp.com/data",
		async:false,
		timeout:10000,
		success:function(data) {
			allData = data;
		},
		error:function(type) {
			alert("timeout");
		},
	});
	
	var students_list = allData["students"];
	var class_list= allData["classes"];
	localStorage.setItem("studentList", JSON.stringify(students_list));
	localStorage.setItem("classList", JSON.stringify(class_list));
	
	for(var sid in students_list) {
		student_name.push(students_list[sid]["name"].replace(/[,\s]/g, ''));}
	for(var name in class_list) {
		class_name.push(name.replace(/\s/g, ''));}
//	console.log(class_list);
}

function findName(input_name) {
	input_name = input_name.replace(/[,\s]/g, '');
	if(student_name.indexOf(input_name.toUpperCase()) > -1) {
		return "Student";
	} else if(class_name.indexOf(capitalizeFirstLetter(input_name)) > -1) {
		return "Professor";
	} else if(input_name.toLowerCase()== "principal") {
		return "Principal";
	} else {
		return "NA";
	}
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}