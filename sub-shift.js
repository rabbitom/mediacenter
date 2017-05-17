#!/usr/bin/env node
const fs = require('fs');
const readline = require('readline');

if(process.argv.length < 5) {
    console.log('Shift time stamp of ass subtitle files.\nUsage: sub-shift.js <source> <target> <shift-time>\nThe shift-time should be in milliseconds, use negative value to move subtitles earlier and positive value for later.');
    process.exit(1);
}

var subfile = process.argv[2];
var outfile = process.argv[3];
var shift = parseInt(process.argv[4]);//-50253;

const rl = readline.createInterface({
    input: fs.createReadStream(subfile)
})

var os = fs.createWriteStream(outfile);

rl.on('line', (line)=>{
    if(line.match(/^Dialogue/)) {
        var parts = line.split(',');
        replaceTime(parts, 1, shift);
        replaceTime(parts, 2, shift);
        // var start = parseTime(parts[1]) + shift;
        // parts[1] = timeString(start);
        // var end = parseTime(parts[2]) + shift;
        // parts[2] = timeString(end);
        os.write(parts.join(','));
    }
    else
        os.write(line);
    os.write('\n');
});

function replaceTime(parts, index, shift) {
    var str = parts[index];
    var time = parseTime(str);
    var timeShifted = time + shift;
    if(timeShifted < 0)
        timeShifted = 0;
    var strShifted = timeString(timeShifted);
    console.log(`${str} -> ${strShifted}`);
    parts[index] = strShifted;
}

function parseTime(str) {
    //var str ="0:14:31.02";
    var a = str.split(':');
    var s = a[2].split('.');
    // if(s.length == 1)
    //     s.push(0);
    var b = [parseInt(a[0]), parseInt(a[1]), parseInt(s[0]), parseInt(s[1])];
    var t = ((b[0] * 60 + b[1]) * 60 + b[2]) * 1000 + b[3] * 10;
    return t;
}

function timeString(t) {
    var ms = t % 1000;
    t = Math.floor(t/1000);
    var s = t % 60;
    t = Math.floor(t/60);
    var m = t % 60;
    var h = Math.floor(t / 60);
    return `${h}:${format2(m)}:${format2(s)}.${format2(ms/10)}`;
}

function format2(t) {
    var s = t.toFixed();
    if(s.length == 1)
        s = '0' + s;
    return s;
}