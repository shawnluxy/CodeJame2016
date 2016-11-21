var classData = {};
classData["classes"] = JSON.parse(localStorage.getItem("classList"));
var courseSection = new Array;
var studentList = new Array;
var className = localStorage.getItem("className");


function courseTime(className, classNum) {
    for (var section_name in classData.classes[className]){
        studentList.push(classData.classes[className][section_name]);
        courseSection.push(section_name);
    }
}

function initial() {
	className = localStorage.getItem("className");
	console.log(courseSection);
	courseTime(className);
	var firstClass =courseSection[0].split("-");
	var secondClass = courseSection[1].split("-");
	var firstStudentList = new Array;
	var secondStudentList = new Array;
	for(var student in studentList[0]) {
	    firstStudentList.push(studentList[0][student]["name"]);
	}
	for(var student in studentList[1]) {
	    secondStudentList.push(studentList[1][student]["name"]);
	}
	//display course name
	$("#header").text(className);
	//first table for first class section
	$("#first").text(courseSection[0]);
	
	for(var i = 0; i < firstStudentList.length; i++) {
	    $('#studentNameOne').append('<tr><td>'+firstStudentList[i]+'</td></tr>');
	}
	//second table for second class section
	$("#second").text(courseSection[1]);
	
	for(var i = 0; i < secondStudentList.length; i++) {
	    $('#studentNameTwo').append('<tr><td>'+secondStudentList[i]+'</td></tr>');
	}	
}