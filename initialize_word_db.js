var fs = require('fs');
var _ = require('underscore');
var redis = require('redis-stream');
var client = new redis(6379, '127.0.0.1');

var stream = client.stream();

function createGraph(lines) {
  var counter = 0;
  _.each(lines, function(line) {
    console.log(counter++);
    var wordGroup = line.split(',');
    var rootWord = wordGroup[0].toLowerCase().replace(/-/g, ' ');

    _.each(wordGroup, function(word) {
      var nodeWord = word.toLowerCase().replace(/-/g, ' ');
      var addWordToRoot = ['RPUSH', 'root:' + rootWord, nodeWord];
      stream.redis.write(redis.parse(addWordToRoot));
      var addRootToWord = ['RPUSH', 'node:' + nodeWord, rootWord];
      stream.redis.write(redis.parse(addRootToWord));
    });
  });
  stream.on('close', function () {
    console.log('Completed!');
  });
  stream.end();
}

function readFile(flush_db) {
  if (flush_db) {
    stream.redis.write(redis.parse(['FLUSHALL']));
  }
  read();
  function read() {
    var lines = '';
    fs.readFile('mobythes.aur', 'utf8', function(error, data) {
      lines = data.split('\r');
      createGraph(lines);
    });
  }
}
readFile(false);
