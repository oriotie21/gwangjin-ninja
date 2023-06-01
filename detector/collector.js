
const IPv4 = require('pcap/decode/ipv4');
const fs = require('fs');
const {exec, execFile, spawn} = require('child_process');
const recognizer = require('./recognizer');
const Queue = require('./queue');
const date = require('date-and-time');
const nfq = require('nfqueue');
const NFQUEUE_NUM = 2;
const csvFileName = "/home/oriotie/gwangjin_ninja/elastic/logs/ml/0519_test.csv";
var count = 1;
var started = false;
var collectTimerId = null;
var pktQueue = new Queue();
var collectable = true;


function log(fileName, contents){

var content = "";

if (!fs.existsSync(fileName)) {
//	content +=  "Status,Timestamp,Source IP,Dest IP,Protocol,Source Port,Dest Port\n";
}
for(var i = 0; i < contents.length; i++){
	content+=contents[i];
if(i < contents.length - 1){
	content += ",";
}
}
fs.appendFileSync(fileName, content+"\n");

}




function startCapture(){
started = true;
//collectTime:wq
	//rId <_ call collectPacketFor()
exec("iptables -A INPUT -s 127.0.0.1 -d 127.0.0.1 -j ACCEPT", (error, stdout, stderr) => {});
exec("iptables -A INPUT -j NFQUEUE --queue-num 0", (error, stdout, stderr) => {});

collectTimerId = setInterval(function(){
if(collectable){
collectable = false;
collectPacketFor(500);
// clearInterval(collectTimerId); //used for debug
}
}, 550);
}
function stopCapture(){
	started = false;
	clearInterval(collectTimerId);
	collectTimerId = null;
}
nfq.createQueueHandler(NFQUEUE_NUM,10000000, function(nfpacket) {

//nfq.NF_DROP or nfq.NF_ACCEPT
pktQueue.enqueue(nfpacket); //waiting packet queue for evaluation

});

function collectPacketFor(millis){
console.log('spawning');
pcapprocess = spawn(__dirname+'/nfq2pcap', ['-q', 1,'-t',2,'-v',3,'-o'+count+'.pcap']);//receive at -q, redirect to -t

pcapprocess.stdout.on('data', (data)=>{console.log(data.toString());});
pcapprocess.stderr.on('data', (data)=>{console.log(data.toString());});
setTimeout(function(){

convertToCSV();
//count += 1;
//kill process
pcapprocess.kill('SIGKILL');
console.log('killed');


}, millis);
}
function csvConvertionFinished(){
	 
fs.exists('1.pcap_Flow.csv',(exists)=>{
if(exists){
//receive result {flowId:prediction}
console.log("file exists");
recognizer.predictFromCSV('1.pcap_Flow.csv').then((results) => {


while(!pktQueue.empty()){
var nfPacket = pktQueue.dequeue();
var packet = new IPv4().decode(nfPacket.payload, 0);
//if protocol is UDP or TCP, get portnumber. otherwise, set port to 0
var protocolNum = packet.protocol;
if(protocolNum == 6 || protocolNum == 17){
	//var flowInfo = [packet.saddr.toString(), packet.daddr.toString(), packet.payload.sport.toString(), packet.payload.dport.toString(), packet.protocol.toString()]
	var flowInfo = [packet.saddr.toString(), packet.daddr.toString(), packet.protocol.toString()]
	var packetinfo = ["", date.format(new Date(),'DD/MM/YYYY HH:mm:ss') , flowInfo[0], flowInfo[1], flowInfo[2], packet.payload.sport.toString(), packet.payload.dport.toString(),];
}else{
	//var flowInfo = [packet.saddr.toString(), packet.daddr.toString(), '0','0','0' ]; 
	var flowInfo = [packet.saddr.toString(), packet.daddr.toString(), '0']; 
	var packetinfo = ["", date.format(new Date(),'DD/MM/YYYY HH:mm:ss'), flowInfo[0], flowInfo[1], flowInfo[2], '0', '0' ];
}
var flowId = flowInfo.join('-');
console.log("flowId : "+flowId);
//console.log("packet : "+nfPacket.payload);
console.log("which packet ? : "+results[flowId]);
result = results[flowId];
packetinfo[0] = (result === undefined) ? "0" : result;
if(result == "0" || result === undefined){
nfPacket.setVerdict(nfq.NF_ACCEPT);

}
else{
nfPacket.setVerdict(nfq.NF_DROP);
}

log(csvFileName, packetinfo);

}
});

}

collectable = true;//ready to collect packet from nfq	
});
}
function convertToCSV(){
	console.log("converting to csv");
	convertprocess = spawn('./cfm',[__dirname+'/'+count+'.pcap','../../'], {cwd:__dirname+'/CICFlowMeter-4.0/bin/'});
	convertprocess.stdout.on('data', (data) => {console.log(data.toString());});
	convertprocess.on('exit', csvConvertionFinished);

}
startCapture();
