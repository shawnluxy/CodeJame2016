//var fakeData = '{"students": {"student1": {"id": "1","name" :"CANDELARIO, AQUINO","classesTaken": "Mathematics-MONDAY-AM0830-AM1030,Physics-TUESDAY-AM0830-AM1030,Biology-WEDNESDAY-AM0830-AM1030,History-FRIDAY-AM0800-AM1030,Sociology-WEDNESDAY-PM0100-PM0300"},"student2": {"id": "10","name": "MARK, ANDERSEN","classesTaken": "Mathematics-MONDAY-AM0830-AM1030,Physics-TUESDAY-AM0830-AM1030,Biology-WEDNESDAY-AM0830-AM1030,History-THURSDAY-AM0830-AM1100,Sociology-WEDNESDAY-PM0100-PM0300"}}}';
//var obj = JSON.parse(fakeData);
var studentData = {};
studentData["students"] = JSON.parse(localStorage.getItem("studentList"));
var classTime = [];

function studentClass(studentId) {
	var totalClass = studentData.students['student' + (studentId)].classesTaken;
	var classList = totalClass.split(",");
	var classInfo = new Array;
	for(var i = 0; i < classList.length; i++) {
		classInfo.push(classList[i].split("-"));
	}
	return classInfo;
}


function castTime(rawTime) {
	var timeSlice = rawTime.slice(2);
	var timeInNumber = Number(timeSlice);
	if(timeInNumber < 800) {
		timeInNumber = timeInNumber + 1200;
	}
	timeInNumber = timeInNumber - 800;
	var numOfHalfHour = (timeInNumber % 100) /30;
	var numOfHour = (parseInt(timeInNumber / 100))/0.5;
	return (numOfHour + numOfHalfHour);
}

function castDay(rawDay) {
	if(rawDay == "MONDAY") {
		return 1;
	}
	if(rawDay == "TUESDAY") {
		return 2;
	}
	if(rawDay == "WEDNESDAY") {
		return 3;
	}
	if(rawDay == "THURSDAY") {
		return 4;
	}
	if(rawDay == "FRIDAY") {
		return 5;
	}
	else{
		return -1;
	}
}

function timeDifference(start, end) {
	return (end - start + 1);
}

function generateTable(classInfo) {
	var Time = $("#schedule th");
	for(var t=6; t<Time.length; t++) {
		classTime.push($(Time[t]).text());
	}
	var box = $("#schedule td");
	for(var i = 0; i < classInfo.length; i++) {
		var classDay = castDay(classInfo[i][1])-1;
		var classStart = castTime(classInfo[i][2]);
		var classEnd = castTime(classInfo[i][3]);
		var classSlot = timeDifference(classStart,classEnd);
		var obj = $(box[5*classStart+classDay]).attr('rowspan', classSlot-1).attr("style","text-align: center; border-color: white; border-width: medium; border-style: inherit; color: white;").text(classInfo[i][0]+"\n"+classTime[classStart]+"-"+classTime[classEnd]);
		obj.html(obj.html().replace(/\n/g,'<br/>'));
		for(var k = (classStart + 1); k < (classEnd) ; k++){
			$(box[5*k+classDay]).remove();
		}
	}
}

function initialSchedule() {
	var id = parseInt(localStorage.getItem("studentID"));
	var name = studentData.students['student' + (id)].name;
	console.log(name);
	$("#name").text(name);
	$("#id").text(id);
	var test = studentClass(id);
	generateTable(test);	
}

