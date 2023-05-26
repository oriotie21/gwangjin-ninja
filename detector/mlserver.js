//const tf = requir``e("@tensorflow/tfjs-node");
const {spawn} = require('child_process');
 function init(){

/*
	console.log(model);
const output = model.predict([0.00e+00, 0.00e+00, 0.00e+00, 0.00e+00,1.81e+02,5.45e+03,0.00e+00,0.00e+00,
 0.00e+00, 0.00e+00, 0.00e+00, 1.00e+00, 0.00e+00, 0.00e+2, 0.00e+00, 0.00e+00
, 0.00e+00, 0.00e+00, 0.00e+00, 0.00e+00, 0.00e+00, 0.00e+00, 8.00e+00, 8.00e+00,
 0.00e+00, 0.00e+00, 0.00e+00, 0.00e+00 ,1.00e+00 ,0.00e+00, 0.00e+00, 9.00e+00,
 9.00e+00, 1.00e+00, 0.00e+00, 1.1, 0.00e+00, 0.00e+00, 0.00e+00, 0.00e+00,
 0.00e+00]);}
*/
// curl -d '{"instances":  [ [1.0, 2.00, 3.0], [3.0,3.0,3.0], [0,0,0], [1,1,1] ] }' -X POST http://localhost:8501/v1/models/testmodel:predict
	var instances = "";
	var input = [];
	instances += "[";
	for(var i=0; i<79; i++){
		input.push(1);

	}
	instances += input.join(',');
	instances += ']';
	/*
	 for(var i=0; i<2; i++){
		instances += "["
		instances += input.join(',');
		if(i != 1)
			instances += "], "
		else
			instances += ']'
	}
	*/

	console.log(input.join(','));
	
	curl_cmd = ['-d','{"instances": ['+ instances +'] }', '-X', 'POST', 'http:\/\/localhost:8501/v1/models/CIC2018_425_SMOTE:predict']; //when json is argument, omit small quote
	console.log(curl_cmd.join(" "));
	curlProcess = spawn('curl', curl_cmd);
	curlProcess.stdout.on( 'data', function (data) {console.log(data.toString());});
}
init();
