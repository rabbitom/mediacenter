#!/usr/bin/env node
const fs = require('fs');
const readline = require('readline');

if(process.argv.length < 5) {
    console.log('Shift time stamp of ass and srt subtitle files.\nUsage:\n\tsub-shift.js <source> <target> <shift-time> [--no-trim]\nThe shift-time should be in milliseconds, use negative value to move subtitles earlier and positive value for later. Will delete dialogues if shifted start time is before 0:00:00, use --no-trim to keep them at the beginning.');
    process.exit(1);
}

var srcfile = process.argv[2];
var outfile = process.argv[3];
var shift = parseInt(process.argv[4]);//-50253;
var trim = true;
if(process.argv.length > 5) {
    if(process.argv[5] == '--no-trim')
        trim = false;
}

//Dialogue: 0,0:00:01.24,0:00:02.51,
var assConfig = {
    pattern: /^Dialogue/,
    splitter: ',',
    startIndex: 1,
    endIndex: 2,
    secondSplitter: '.',
    formatMs: function(ms) {
        return formatFixed(ms/10, 2);
    },
    formatH: function(h) {
        return h.toFixed();
    }
}

//00:00:01,240 --> 00:00:02,510
var srtConfig = {
    pattern: /-->/,
    splitter: ' --> ',
    startIndex: 0,
    endIndex: 1,
    secondSplitter: ',',
    formatMs: function(ms) {
        return formatFixed(ms, 3);
    },
    formatH: function(h) {
        return formatFixed(h, 2);
    }
}

var subConfig;
if(srcfile.endsWith('.ass'))
    subConfig = assConfig;
else if(srcfile.endsWith('.srt'))
    subConfig = srtConfig;
else {
    console.error('Unkown format of source file!');
    process.exit(1);
}

const rl = readline.createInterface({
    input: fs.createReadStream(srcfile)
})

var os = fs.createWriteStream(outfile);

rl.on('line', (line)=>{
    if(line.match(subConfig.pattern)) {
        var parts = line.split(subConfig.splitter);
        var start = parseTime(parts[subConfig.startIndex]) + shift;
        if(start < 0) {
            if(trim)
                return;
            else
                start = 0;
        }
        parts[subConfig.startIndex] = timeString(start);
        var end = parseTime(parts[subConfig.endIndex]) + shift;
        parts[subConfig.endIndex] = timeString(end);
        os.write(parts.join(subConfig.splitter));
    }
    else
        os.write(line);
    os.write('\n');
});

function parseTime(str) {
    //ass 0:14:31.02
    //srt 00:00:13,420
    var a = str.split(':');
    var s = a[2].split(subConfig.secondSplitter);
    if(s.length == 1)
        s.push(0);
    else if(s[1].length == 2)
        s[1] += '0';
    else if(s[1].length == 1)
        s[1] += '00';
    var b = [parseInt(a[0]), parseInt(a[1]), parseInt(s[0]), parseInt(s[1])];
    var t = ((b[0] * 60 + b[1]) * 60 + b[2]) * 1000 + b[3];
    return t;
}

function timeString(t) {
    var ms = t % 1000;
    t = Math.floor(t/1000);
    var s = t % 60;
    t = Math.floor(t/60);
    var m = t % 60;
    var h = Math.floor(t / 60);
    return `${subConfig.formatH(h)}:${formatFixed(m,2)}:${formatFixed(s,2)}${subConfig.secondSplitter}${subConfig.formatMs(ms)}`;
}

function formatFixed(n, length) {
    var str = n.toFixed();
    while(str.length < length)
        str = '0' + str;
    return str;
}
