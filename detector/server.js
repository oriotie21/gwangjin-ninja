const express = require('express'); // Express 모듈 불러오기
const app = express(); // Express 앱 생성
const pcapW = require('./nfq-pcap-writer');
const PORT = 3000; // 서버 포트 번호
const exec = require('child_process').exec;
const Queue = require('./queue');
var nfq = require('nfqueue');
var IPv4 = require('pcap/decode/ipv4');
var pcap = require('pcap-writer');
//const pcapWriter = require('pcap-writer');
//const writer = pcapWriter.createPcapWriter('file.pcap', 1500, 105);
var counter = 0;
var nfqBuffer = new Queue();
// 루트 경로에 대한 GET 요청 핸들러
app.get('/', (req, res) => {
  res.send('Hello, World!'); // 응답 메시지
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);

});
//file init

	var child = exec("ls", function(error, stdout, stderr){});
	child.kill('SIGINT');
console.log(child);
pcapFile = new pcapW("test.pcap");
nfq.createQueueHandler(0,10000000, function(nfpacket) {
  console.log("-- packet received --");

  //console.log(JSON.stringify(nfpacket, null, 2));
  // Decode the raw payload using pcap library
  //var packet = new IPv4().decode(nfpacket.payload, 0);
	//console.log(nfpacket);
	//writer.writePacket(Buffer.from(nfpacket, 'utf-8'));
	//writer.writePacket(nfpacket.payload);
	//console.log(packet);
  // Or modify packet and set updated payload
  pcapFile.writePacket(nfpacket.payload);
	console.log("accepted");
  nfpacket.setVerdict(nfq.NF_ACCEPT, null, nfpacket.payload);
});

