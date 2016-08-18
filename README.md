# Synpuzzle

Similar to something like morewords.com but supports the addition of synonyms. Not optimized for use without synonyms to limit search space.

Steps to setup:

1. Install Node
2. Install redis. Follow instructions to build and run redis-server.
3. Run npm install in directory.
4. Run node initialize_word_db.js (This can use a lot of memory)
5. Run node app.js


![Demo](https://raw.githubusercontent.com/davidz-eng/Synpuzzle/master/Picture.png)
