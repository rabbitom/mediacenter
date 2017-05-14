var tapi = require('torrentapi-wrapper');

var query = 'Silicon Valley';
var max_size = 200000000;
var max_count = 1;
if(process.argv.length >= 3)
    query = process.argv[2];
if(process.argv.length >= 4)
    max_size = process.argv[3] * 1000000;
if(process.argv.length >= 5)
    max_count = process.argv[4];
console.log(`checking torrents for "${query}", size limited to ${max_size / 1000000}MB, will show ${max_count} results at most...`);

tapi.search('Media Center In Snap', {
    query: query,//'Madam Secretary S03E17',//'Silicon Valley',
    limit: 25,
    sort: 'seeders',
    category:'tv'
}).then(function (results){
    var count = 0;
    for(var item of results) {
        if(item.size < max_size) {
            console.log(item);
            if(++count >= max_count)
                break;
        }
    }
}).catch(function (err){
    console.error(err);
});
