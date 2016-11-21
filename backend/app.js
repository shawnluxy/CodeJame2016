var fs = require('fs');
var class_list = JSON.parse(fs.readFileSync('classes.json', 'utf8')).classes;
var students_list = JSON.parse(fs.readFileSync('studentsByAvailability.json', 'utf8'));
var total_fited_spots = 0;

function format_time(time){
	return time.slice(-2).toUpperCase()+time.slice(0,2)+time.slice(3,5);
}

function validate_time(time){
    var hour_minute = time.split(':');
    if (hour_minute[0].length != 2)
        hour_minute[0] = '0' + hour_minute[0];
    if (hour_minute[1].length != 4)
        hour_minute[1] = '0' + hour_minute[1];
    time = hour_minute[0] + ':' + hour_minute[1];
    return time;
}

function sumAvailTime(avail, time_coverage) {
	var avail = avail;
    
    for (var avail_name in avail){
        var day = avail[avail_name].day;
        var start = avail[avail_name].start;
        var end = avail[avail_name].end;
        if (start<time_coverage[day].start)
            avail[avail_name].start = start;
        if (end>time_coverage[day].end)
            avail[avail_name].end = end;
    }
    
    var sum = 0;
	var len = Object.keys(avail).length;
	for(var index in avail) {
		var start_time = avail[index].start.split(":");
		var end_time = avail[index].end.split(":");
		sum += (end_time[0]-start_time[0])*60 + (end_time[1]-start_time[1]);
	}
    return sum;
}

function sorting(students_list, time_coverage) {
	var sortlist = [];
	var sorted = {};
	for(var id in students_list) {
		sortlist.push({ID:id,NAME:students_list[id]});
	}
	sortlist.sort(function(a,b) {
		var x = sumAvailTime(a.NAME[1], time_coverage);
		var y = sumAvailTime(b.NAME[1], time_coverage);
		return x-y;
	});
	for(var i=0; i<sortlist.length; i++) {
		sorted[i.toString()] = sortlist[i].ID;
	}
	return sorted;	// output like {"0":"1","1":"3","2":"2"}, start with 0
}

function getSortedKeys(obj) {
    var keys = []; for(var key in obj) keys.push(key);
    keys.sort(function(a,b){return obj[a]-obj[b]});
    var result = {};
    for(var i = 0; i < keys.length; i++){
        result[keys[i]] = obj[keys[i]];
    }
    return result;
}

function get_class_time_coverage(class_list){
    var time_coverage = {};
    for (var class_name in class_list){
        for (var section_name in class_list[class_name].times){
            var day = (class_list[class_name].times[section_name].day);
            var start = (class_list[class_name].times[section_name].start);
            var end = (class_list[class_name].times[section_name].end);
            if (time_coverage[day] === undefined){
                time_coverage[day] = {};
                time_coverage[day].start = start;
                time_coverage[day].end = end;
            }else{
                if (start < time_coverage[day].start)
                    time_coverage[day].start = start;
                if (end > time_coverage[day].end)
                    time_coverage[day].end = end;
            }
        }
    }
    return time_coverage;
}

function process_student_availability(students_list){
	for (var student_name in students_list){
		var student = students_list[student_name];
		for (var availability_name in student[1]){
			var availability = student[1][availability_name];
			if (availability.start === 'NA'){
				delete students_list[student_name][1][availability_name];
			}else{
                
                student[1][availability_name].start = validate_time(student[1][availability_name].start);
                student[1][availability_name].end = validate_time(student[1][availability_name].end);
                availability = student[1][availability_name];
                
				students_list[student_name][1][availability_name].start = (availability.start.slice(-2) === 'am' || availability.start.slice(0,2) == 12)?(availability.start.slice(0,5)):(parseInt(availability.start.slice(0,2))+12 + ':' + availability.start.slice(3,5));
				students_list[student_name][1][availability_name].end = (availability.end.slice(-2) === 'am' || availability.end.slice(0,2) == 12 )?(availability.end.slice(0,5)):(parseInt(availability.end.slice(0,2))+12 + ':' + availability.end.slice(3,5));
			}
		}
	}
}

function process_class_time(class_list){
	for (var class_name in class_list){
		var course = class_list[class_name];
		for (var time_name in course.times){
            class_list[class_name].times[time_name].start = validate_time(class_list[class_name].times[time_name].start);
            class_list[class_name].times[time_name].end = validate_time(class_list[class_name].times[time_name].end);
			var time_slot = course.times[time_name];
            
            class_list[class_name].times[time_name].start = (time_slot.start.slice(-2) === 'am' || time_slot.start.slice(0,2) == 12)?(time_slot.start.slice(0,5)):(parseInt(time_slot.start.slice(0,2))+12 + ':' + time_slot.start.slice(3,5));
            class_list[class_name].times[time_name].end = (time_slot.end.slice(-2) === 'am'|| time_slot.end.slice(0,2) == 12)?(time_slot.end.slice(0,5)):(parseInt(time_slot.end.slice(0,2))+12 + ':' + time_slot.end.slice(3,5));
		}
	}
}

function generate_class_list(class_list){
	result_list = {};
	result_list.classes = {};
    result_list.students = {};
	for (var key in class_list){
		var class_name = class_list[key].name;
		result_list.classes[class_name] = {};
		for (var section in class_list[key].times){
            class_list[key].times[section].start = validate_time(class_list[key].times[section].start);
            class_list[key].times[section].end = validate_time(class_list[key].times[section].end);
            
			var section_name = class_list[key].times[section].day.toUpperCase()+
								'-'+format_time(class_list[key].times[section].start)+
								'-'+format_time(class_list[key].times[section].end);

			result_list.classes[class_name][section_name] = {};
		}
	}
	return result_list;
}

function length_json(obj){
    return Object.keys(obj).length;
}

// return time2 - time1
function time_difference(time1, time2){
    var time_one;
    var time_two;
    if (time1[1] === 'M'){
        time_one = (time1.slice(0,2) === 'AM'|| time1.slice(2,4) == 12)? (time1.slice(2,4)+':'+time1.slice(4,6)):(parseInt(time1.slice(2,4))+12+':'+time1.slice(4,6));
    }else{
        time_one = time1;
    }
    
    if (time2[1] === 'M'){
        time_two = (time2.slice(0,2) === 'AM'|| time2.slice(2,4) == 12)? (time2.slice(2,4)+':'+time2.slice(4,6)):(parseInt(time2.slice(2,4))+12+':'+time2.slice(4,6));
    }else{
        time_two = time2;
    }
    
    if (time_two < time_one)
        return;   

    var answer = ((time_two.split(':')[0] - time_one.split(':')[0])*60 + (time_two.split(':')[1] - time_one.split(':')[1]));
    
    return answer;
}

function calc_margin_time(student_avail, course_time){
    // console.log(course_time);
    var course_time = course_time.split('-');
//    console.log('course_time'+course_time);
    for (var avail in student_avail){
//        console.log('1'+student_avail[avail].day.toUpperCase());
//        console.log('2'+course_time[1]);
        if (student_avail[avail].day.toUpperCase() === course_time[1]){
//            console.log(Math.min((time_difference(course_time[2], student_avail[avail].start)), (time_difference(student_avail[avail].end, course_time[3]))));
//            console.log(student_avail[avail].start);
//            console.log(student_avail[avail].end);
            return Math.min((time_difference( student_avail[avail].start,course_time[2])), (time_difference(course_time[3],student_avail[avail].end)));
        }
    }
}

function find_min_margin_time(student, courses){
    var course_min_margin_list = {};
//     console.log(courses.length);
    for (var i = 0; i < courses.length; i++){
        var course = courses[i];
//        console.log(course);
        var margin_time = calc_margin_time(student[1], course);
        
//        console.log(margin_time);
        if (margin_time>=0){
//            console.log('margin_time');
            course_min_margin_list[course] = margin_time;
        }
    }
    return course_min_margin_list;
}

// is_conflict('WEDNESDAY-PM0300-PM0500', result_list, 1)
function is_conflict(course, result_list, id){
    
    for (var student_label in result_list.students){
        var student = result_list.students[student_label];
//        console.log(student);
        if(student.id == id){
            var class_time = course.split('-');
            var class_taken_list = student.classesTaken.split(',');
            for (var i = 0; i < class_taken_list.length; i++ ){
                var class_taken = class_taken_list[i];
//                console.log("class_taken"+class_taken);
                var class_taken_time = class_taken.split('-');
//                console.log("class_taken_time"+class_taken_time);
                if (class_time[1] === class_taken_time[1]){
                    if ((time_difference(class_taken_time[2], class_time[2]) && time_difference(class_taken_time[3], class_time[2]) === undefined) || (time_difference(class_taken_time[2], class_time[3]) && time_difference(class_taken_time[3], class_time[3]) === undefined))
                        return true;
                }
                
                if(class_time[0] === class_taken_time[0] || class_time[2] === class_taken_time[2] || class_time[3] === class_taken_time[3])
                    return true;
            }
            return false;
        }
    }
    return false;
}

function filter_margin_time(course_min_margin_list, result_list, id){
    for (var course in course_min_margin_list){
        // console.log(164);
        if(is_conflict(course, result_list, id))
            delete course_min_margin_list[course];
        else{
            var course_name = course.split('-')[0];
    var section_name = course.split('-')[1] +'-'+ course.split('-')[2] +'-'+ course.split('-')[3];
            course_min_margin_list[course] = length_json(result_list.classes[course_name][section_name]);
            
            
        }
    }
}

function register_course(course, name, result_list, id, opened_classes, unopened_classes){
    var last_label1 = 'student0';
    var last_label2 = 'student0' ;
    
    if (opened_classes.indexOf(course) < 0){
        opened_classes.push(course);
        var index = unopened_classes.indexOf(course);
        // delete unopened_classes[index];
        unopened_classes.shift();
    }
    var course_name = course.split('-')[0];
    var section_name = course.split('-')[1] +'-'+ course.split('-')[2] +'-'+ course.split('-')[3];
    
    
    for (var student_label in result_list.classes[course_name][section_name]){
        last_label1 = student_label;
    }
    
    last_label1 = 'student' + (parseInt(last_label1.split('t').reverse()[0])+1);
    // console.log(course_name);
    // console.log(section_name);
    // console.log(last_label1);
    result_list.classes[course_name][section_name][last_label1] = {};
    result_list.classes[course_name][section_name][last_label1].id = id;
    result_list.classes[course_name][section_name][last_label1].name = name;
    
    for (var student_label in result_list.students){
        last_label2 = student_label;
//        console.log(result_list.students[student_label].id);
//            console.log(id);
        if (result_list.students[student_label].id === id){
            
            result_list.students[student_label].classesTaken = (result_list.students[student_label].classesTaken === undefined) ? (course):(result_list.students[student_label].classesTaken.concat(','+course));
            return;
        }
    }
//    console.log(result_list.students);
    last_label2 = 'student' + (parseInt(last_label2.split('t').reverse()[0])+1);
//    console.log("new students added "+last_label2);
    result_list.students[last_label2] = {};
    result_list.students[last_label2].id = id;
    result_list.students[last_label2].name = name;
    result_list.students[last_label2].classesTaken = course;
    
}

function find_best_fit_time_slot(students_list, id, result_list, opened_classes, unopened_classes){
    var number_of_course_register = 0;
    var course_min_margin_list = find_min_margin_time(students_list[id], opened_classes);
    course_min_margin_list = getSortedKeys(course_min_margin_list);
//    console.log(course_min_margin_list);
    filter_margin_time(course_min_margin_list, result_list, id);
//    console.log(course_min_margin_list);
    
//       console.log(course_min_margin_list);

    for (var course in course_min_margin_list){
//        console.log('course'+course_min_margin_list[course]);
        // console.log(211);
        var course_name = course.split('-')[0];
        var section_name = course.split('-')[1] +'-'+ course.split('-')[2] +'-'+ course.split('-')[3];
        if (!is_conflict(course, result_list, id)&& length_json(result_list.classes[course_name][section_name]) < 20){
//            console.log("entered here");
            register_course(course, students_list[id][0], result_list, id, opened_classes, unopened_classes);
            number_of_course_register++;
            total_fited_spots++;
            if (number_of_course_register >= 5)
                return;
        }
    }
    
    
    console.log("CAN\'T FIT ALL STUDENTS " + id);
}

function fit(students_list, result_list, opened_classes, unopened_classes, time_coverage){
    var sorted = sorting(students_list, time_coverage);
    for (var id in students_list){
        find_best_fit_time_slot(students_list, sorted[id-1], result_list, opened_classes, unopened_classes);
//                find_best_fit_time_slot(students_list, id, result_list, opened_classes, unopened_classes);
    }
}

// main

var result_list = generate_class_list(class_list);
var opened_classes = [];
var unopened_classes = [];
//for (var class_name in result_list.classes){
//    for (var section_name in result_list.classes[class_name]){
//        unopened_classes.push(class_name+'-'+section_name);
//    }
//};

for (var class_name in result_list.classes){
    for (var section_name in result_list.classes[class_name]){
        opened_classes.push(class_name+'-'+section_name);
    }
};


process_student_availability(students_list);
process_class_time(class_list);
var time_coverage = get_class_time_coverage(class_list);

// console.log(result_list);
 fit(students_list, result_list, opened_classes, unopened_classes, time_coverage);

fs.writeFile('codejam-challenge.json', JSON.stringify(result_list, null, 4));

// console.log(result_list);
console.log("total fited spots: "+total_fited_spots);
module.exports.get_result = function(){
    return result_list;
}
