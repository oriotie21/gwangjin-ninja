const Queue = require('./queue');
const fs = require('fs');
const nfq = require('nfqueue');
const moment = require('moment');
const {spawn} = require('child_process');
const predictionNameList = ["Benign", "Bot", "Brute Force-WEB", "Burte Force-XSS", "DDOS attack-HOIC", "DDOS attack-LOIC-UDP", "DDOS attack-LOIC-HTTP", "Dos Attacks-GoldenEye", "Dos attacks-Hulk", "Dos attacks-slowHTTPTest", "Dos attacks-SlowIoris", "FTP-BruteForce", "Infilteration", "SQL-Injection", "SSH-Bruteforce"];
const NFQUEUE_NUM = 2;
var pktQueue = new Queue();
var fileName = "0519_test.log";

function request(curlCommand) {
  return new Promise((resolve, reject) => {
    const curlProcess = spawn('curl', curlCommand, { maxBuffer: 1024 * 1024 });
    let responseData = '';
    curlProcess.stdout.on('data', (data) => {
      responseData += data;
    });

    curlProcess.stderr.on('data', (error) => {
     // reject(error);
    });

    curlProcess.on('close', (code) => {
      if (code === 0) {
        resolve(responseData);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

 function predict(flowIds, inputs){
	return new Promise(async (resolve, reject) =>  {
// curl -d '{"instances":  [ [1.0, 2.00, 3.0], [3.0,3.0,3.0], [0,0,0], [1,1,1] ] }' -X POST http://localhost:8501/v1/models/testmodel:predict
	var instances = "";
	 if(inputs.length <= 0){
		 return;
	 }
	for(var i=0; i<inputs.length; i++){
	instances += "[";
	
	instances += inputs[i].join(',');
	instances += ']';
	if(i != inputs.length - 1){
		instances += ',';	
	}
	}
//	curl_cmd = ['-H','Content-Type: application/json', '-d','{ "instances" : [ \"'+ instances +'\"] }', '-X', 'POST', 'http:\/\/localhost:8501/predict']; //when json is argument, omit small quote
	
	curl_cmd = ['-H','Content-Type: application/json', '-X', 'POST', 'http:\/\/localhost:8501/predict']; //when json is argument, omit small quote
	//console.log(curl_cmd);
	/*
	curlProcess = spawn('curl', curl_cmd, { maxBuffer: 1024 * 1024 });
	var results = {};
	curlProcess.stdout.on('data', (data) => {
	//get hightest property
	var prediction_list = JSON.parse(data).predictions.toString(); // result array
	prediction_list = prediction_list.substr(1, prediction_list.length-2).replace(/\s/g,"").replace(/'/g,""); //remove quots
	prediction_list = prediction_list.split(',');
	console.log(flowIds);	
	for(var i=0; i<prediction_list.length; i++){
		results[flowIds[i]] = prediction_list[i];
		fs.appendFileSync(fileName, flowIds[i]+","+prediction_list[i]+"\n");
	}
	console.log("result 1 : "+results);
	});
	*/
	try{
	var data = await request(curl_cmd);
	var results = {}; //dictionary that stores result by flowID
	var prediction_list = JSON.parse(data).predictions.toString(); // result array
	prediction_list = prediction_list.substr(1, prediction_list.length-2).replace(/\s/g,"").replace(/'/g,""); //remove quots
	prediction_list = prediction_list.split(',');
	for(var i=0; i<prediction_list.length; i++){
		results[flowIds[i]] = prediction_list[i];
		fs.appendFileSync(fileName, flowIds[i]+","+prediction_list[i]+"\n");
	}


	resolve(results);	
	}catch(error){
	reject(error);
	}
	});
}
function logToFile(attributeList){
	for(item in attributeList){


	}
}
function evaluate(predictions){ 	
	var max_index = 0, max_value = -1; //최고로 확률이 높은 속성 구함
	for(var i=0; i<predictionNameList.length; i++){
		if(max_value < predictions[i]){
			max_index = i;
			max_value = predictions[i];
		}
	}
	return predictionNameList[max_index];
}
function predictFromCSV(filename){
return new Promise(async (resolve, reject) => {
var csvLines = fs.readFileSync(filename,'utf-8', (err) => {console.log(err);})
.split('\n').map(e => e.trim());
//한번에 다 넘겨줘야할듯
var flowIDList = [];
var featureList = [];
for(i=1; i<csvLines.length-1; i++){ //[length-1] removes last null element
var input = csvLines[i].split(',');
flowIDList.push(input[0]);
//input = input.slice(4,83); his model only
input = input.slice(0,79);// his model only
//input[2] = new Date(input[2]).getTime(); //timestamp 부분. 제대로 가공 필요함
timestamp = moment(input[2], "DD/MM/YYYY HH:mm:ss");
//input[2] = timestamp.unix();
input[2] = 0;

featureList.push(input);
}
console.log("flowIdLists : "+flowIDList.toString());
//results = predict(flowIDList, featureList);
var results = await predict(flowIDList, featureList)

resolve(results);
});

}




//function exports
module.exports.predictFromCSV = predictFromCSV;
