var userid;
var apigClient;
var pageNum;
var accessToken;
$('document').ready(function () {
	//console.log("start");
	var url = window.location.href;
	/*if (url.includes('access_token')) {
		console.log('changing access token');
		accessToken = url.split('#')[1].split('&')[1].split('=')[1];
		window.localStorage.setItem('access-token', accessToken);
	}*/
	if (url.includes('code')) {
		console.log('changing code token');
		accessToken = url.split('=')[1];
		window.localStorage.setItem('access-token', accessToken);
	}
	else {
		accessToken = window.localStorage.getItem('access-token');
	}
	//if (window.localStorage.getItem('access-token')==null || window.localStorage.getItem('access-token')=='null')
	//	window.location = "signout.html";
    apigClient = apigClientFactory.newClient();
    var body = {
        key : "Hello"
    };
     var params = {username : accessToken, user_id : accessToken};
      var additionalParams = {headers: {
      'Content-Type':"application/json"
    }};
	//console.log("username is "+username)
    apigClient.profileGet(params, body)
        .then(function (result) {
		  if (result.invalid_access_token=='1' || result.data.invalid_access_token=='1')
			window.location = "https://macrochef.auth.us-east-1.amazoncognito.com/login?client_id=6lk5ruvv1ntna00ki628iookjb&response_type=token&scope=phone+email+openid+aws.cognito.signin.user.admin+profile&redirect_uri=https://macrochef.s3.amazonaws.com/Resources/HTML/profile.html";
		  populateFields(JSON.parse(result.data.body));
        }).catch(function (result) {
          alert('Permission Denied')
          console.log("result on failure is "+result);
          console.log("Something went wrong!");
        });  
	$( '#activity, #sex, #age, #height, #weight').change(function() {
		var sex = document.getElementById("sex").value;
		var age = document.getElementById("age").value;
		var height = document.getElementById("height").value;
		var weight = document.getElementById("weight").value;
		var activity = document.getElementById("activity").value;
		var bmr = 0;
		var dci = 0;
		if(sex == "male"){
			bmr = (10*weight) + (6.25*height) - (5*age) + 5;
		} else if(sex == "female"){
			bmr = (10*weight) + (6.25*height) - (5*age) - 161;
		} else {
			bmr = (10*weight) + (6.25*height) - (5*age) + 5;
		}
		if(activity == "0") {
			dci = bmr*1.2;
		} else if(activity == "1") {
			dci = bmr*1.375;
		} else if(activity == "2") {
			dci = bmr*1.55;
		} else if(activity == "3") {
			dci = bmr*1.725;
		} else if(activity == "4") {
			dci = bmr*1.9;
		} else{
			dci = bmr*1.2;
		}
		dci = Math.round(dci);
		var bmi = Math.round( (weight/Math.pow(height/100, 2)) * 10 ) / 10;
		document.getElementById("calorieintake").placeholder = "Suggested Calorie Intake "+dci+" Kcal/day";
		var note = "Your BMI is "+bmi+" kg/m"+"2".sup()+"\nTo maintain your weight you need "+dci+" Kcal/day\nTo lose 0.5 kg per week you need "+(dci-500)+" Kcal/day\nTo lose 1 kg per week you need	"+(dci-1000)+" Kcal/day\nTo gain 0.5 kg per week you need "+(dci+500)+" Kcal/day<br>To gain 1 kg per week you need "+(dci+1000)+" Kcal/day"
		document.getElementById("calnote").innerHTML = "<pre>" + note + "</pre>"
	});
  });

function populateFields(data) {
	console.log("user id is "+data.user_id);
	window.localStorage.setItem('userid', data.user_id);
	pageNum = data.completion_level;
	console.log("pageNum type is "+(typeof pageNum));
	console.log("pageNum is "+pageNum);
	if (pageNum<5)
		redirectPage(pageNum);
	if (Object.keys(data).length>2) {
		$('#firstname').val(data.first_name);
		$('#lastname').val(data.last_name);
		$('#sex').val(data.sex);
		$('#phone').val(data.phone);
		$('#age').val(data.age);
		$('#weight').val(data.weight);
		$('#height').val(data.height);
		$('#calorieintake').val(data.daily_calorie_intake);
		$('#activity').val(data.activity); // 0-Little to no exercise, 1-Light exercise, 2-Moderate exercise, 3-Heavy exercise, 4-Very heavy exercise
		$('#dietary').val(data.deitary_restrictions); // vegan, ovovegan, lacvegan, lacovovegan, pesce
		$('#allergy').val(data.food_allergies);
	}
	$('#loading').hide();
}

function redirectPage(pageNum) {
	$('#redirect-bar').remove();
	console.log("redirecting to page "+pageNum);
	if (pageNum==1) {
		window.location = "preferences.html";
	} else if (pageNum==2) {
		window.location = "calendar.html";
	} else if (pageNum==3) {
		window.location = "addressbook.html";
	} else if (pageNum==4) {
		window.location = "billinginfo.html";
	}
}

function update() {
	console.log('Line 118 reached')
	$('#loading').show();
	var body = {
		"user_id" : userid,
		"page_num" : pageNum,
		"first_name" : $('#firstname').val(),
		"last_name" : $('#lastname').val(),
		"phone" : $('#phone').val(),
		"sex" : $('#sex').val(),
		"age" : $('#age').val(),
		"weight" : $('#weight').val(),
		"height" : $('#height').val(),
		"daily_calorie_intake" : $('#calorieintake').val(),
		"activity" : $('#activity').val(), // 0-Little to no exercise, 1-Light exercise, 2-Moderate exercise, 3-Heavy exercise, 4-Very heavy exercise
		"deitary_restrictions" : $('#dietary').val(), // vegan, ovovegan, lacvegan, lacovovegan, pesce
		"food_allergies" : $('#allergy').val()
	};
	console.log("body from update is "+body);
	var username;
	var params = {username: userid, body: body};
	console.log("body 2 is :"+body);
	console.log("params is "+params)
	apigClient.profilePost(params, body)
	.then(function (result) {
	  $('#submitnote').removeAttr('hidden');
	  console.log("pageNum from update is "+pageNum)
	  window.location.href= 'preferences.html';
	  console.log("result logged is "+result);
	}).catch(function (result) {
	  alert('Permission Denied');
	  setTimeout(function(){ console.log("result 2 is : "+result);}, 150000);
	  console.log("Something went wrong!");
	});
	return false;
}