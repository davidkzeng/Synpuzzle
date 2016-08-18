var express = require('express');
var app = express();
var redisClient = require('redis').createClient();
var _ = require('underscore');

app.use('/static', express.static('static'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/main.html');
});

app.get('/ajax/matchwords', function(req, res) {
  var synonymList = req.query.synonyms.split(/, |,/g);
  synonymList = synonymList.filter(function(synonym) {
    return synonym != '';
  });
  collectPotentialWords(synonymList, function(potentialWords) {
    if (req.query.regex) {
      var processedRegex = processRegex(req.query.regex);
      potentialWords = filterRegex(processedRegex, potentialWords);
    }
    res.send(JSON.stringify(potentialWords));
  });
});

app.listen(8000, function() {
  console.log('Listening on port 8000');
});

function collectPotentialWords(synonymList, callback) {
  if (synonymList.length == 0) {
    redisClient.keys('*', function(err, replies) {
      var potentialWords = {};
      replies = replies.map(function(word) {
        return word.substr(word.indexOf(':') + 1);
      });
      replies.forEach(function(word) {
        potentialWords[word] = 1;
      });
      callback(potentialWords);
    });
  } else {
    collectRoots(synonymList, callback);
  }
}

function collectRoots(synonymList, callback) {
  var rootsToCheck = {};
  var multiGetRoots = redisClient.multi();
  _.each(synonymList, function(synonym, i) {
    multiGetRoots.lrange('node:' + synonym, 0, -1);
  });
  multiGetRoots.exec(function(err, replies) {
    var roots = _.flatten(replies);
    _.each(roots, function(synonymRoot) {
      if (!rootsToCheck[synonymRoot]) {
        rootsToCheck[synonymRoot] = 0;
      }
      rootsToCheck[synonymRoot]++;
    });
    collectNodes(rootsToCheck, callback);
  });
}

function collectNodes(rootsDict, callback) {
  var potentialWords = {};
  var roots = Object.keys(rootsDict);
  var multiGetNodes = redisClient.multi();
  _.each(roots, function(rootWord, i) {
    multiGetNodes.lrange('root:' + rootWord, 0, -1);
    if (!potentialWords[rootWord]) {
      potentialWords[rootWord] = 0;
    }
    potentialWords[rootWord] += 100;
  });
  multiGetNodes.exec(function(err, replies) {
    for (var i in replies) {
      _.each(replies[i], function(node) {
        if (!potentialWords[node]) {
          potentialWords[node] = 0;
        }
        potentialWords[node] += rootsDict[roots[i]];
      });
    }
    callback(potentialWords);
  });
}

function filterRegex(regexString, potentialWords) {
  var re = new RegExp('^' + regexString + '$');
  var filtered = {};
  for (var word in potentialWords) {
    if (re.test(word)) {
      filtered[word] = potentialWords[word];
    }
  }
  return filtered;
}

function processRegex(regexString) {
  return regexString
      .toLowerCase()
      .replace(/_|-/g, '[a-z]');
}