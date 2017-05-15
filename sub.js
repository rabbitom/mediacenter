var sub = require('addic7ed-api');
var exec = require('child_process').exec;

var show = 'Silicon Valley';
var season = 4;
var episode = 4;

function num2str(num) {
    return ((num < 10) ? '0' : '') + num;
}

var filename = `${show.replace(' ', '.')}.S${num2str(season)}E${num2str(episode)}.srt`;
var shell = `echo '<a href="${filename}">${filename}</a>' >> ../sub/index.html`;

sub.search(show, season, episode, 'eng').then(function (subs) {
    var subInfo = subs[0];
    if(subInfo)
        return sub.download(subInfo, '../sub/' + filename);
    else
        throw new Error('');
}, function() {
    throw new Error('search subtitle failed!');
}).then(function() {
    console.log('subtitle file saved');
    exec(shell, function(err) {
        if(err) {
            if(err instanceof Error)
                throw err;
            else
                throw new Error(err);
        }
        else
            console.log('subtitle index updated');
    });
}).catch(function(error) {
    console.error(error.message);
});
