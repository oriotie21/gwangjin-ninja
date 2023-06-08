
const GMT_TIMEZONE = +0 ; //GMT + 9

const fs = require('fs');

class NfqPcapWriter{

writeAndFlush(){
	if(this.filename == undefined){
		console.log("no file");
		return;
	}
	fs.appendFile(this.filename, this.ptPcap.subarray(0, this.offset), function(err, buf){} ); //buffer.slice 대신 buffer.subarray 사용
	this.offset = 0;
}
constructor(filename){
this.filename = filename;
this.ptPcap = Buffer.alloc(10000); //each pcap size? vulnerable yet
this.offset = 0;
this.writeInt(0xa1b2c3d4); // magic number
this.writeShort(0x2); //major ver
this.writeShort(0x4); //minor ver
this.writeInt(-3600 * GMT_TIMEZONE); //thisstamp
this.writeInt(0); //sigfigs
this.writeInt(65534); //snaplen
this.writeInt(0); //data link type (NULL)
//packet header only

//empty packet payload

this.writeAndFlush();
//flush and write

console.log(this.ptPcap);

}
writeInt(n){
		this.ptPcap.writeUInt32BE(n, this.offset);
		this.offset += 4;
}
writeShort(n){
		this.ptPcap.writeUInt8(n, this.offset);
		this.offset += 2;
}
writeRaw(dat){
		console.log(dat.length);
		var datlen = dat.length;
		dat.copy(this.ptPcap ,this.offset);
		this.offset += datlen;
}
writePacket(payload){
	var payloadLength = payload.length;
	console.log(payload);
	console.log(payloadLength);
	var millis = Date.now();
	this.writeInt(parseInt(millis / 1000));
	this.writeInt(millis % 1000 * 1000);
	this.writeInt(payloadLength);
	this.writeInt(payloadLength);
		
	this.writeRaw(payload);
	this.writeAndFlush();
}

}
/*
var fs = require("fs");
var nfq =new NfqPcapWriter('test.pcap');
fs.readFile("sample.pcap", function(err, buf) {
  //console.log(Buffer.from(buf));

});
*/
module.exports = NfqPcapWriter;



