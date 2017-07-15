var request = require("request");
var keys = require("./keys.js");

var liri = {
  command: "",
  args: [],

  run: function(){
    console.log("START");
    this.command = process.argv[2].toLowerCase();
    if(process.argv.length >2){
      this.args = process.argv.slice(3, process.argv.length);
    }
    this.runCommand();

  },

  runCommand: function(){
    console.log(this.command);
    if(this.command === "my-tweets"){
      this.myTweets();
    }
    if(this.command === "spotify-this-song"){
      this.spotifyThisSong();
    }
    if(this.command === "my-tweets"){
      this.myTweets();
    }
    if(this.command === "my-tweets"){
      this.myTweets();
    }
  },

  myTweets: function(){
    console.log("Tweets");
  },

  spotifyThisSong: function(){
    console.log("spotify");
  },

  movieThis: function(){
    console.log("movie");
  },

  doWhatItSays: function(){
    console.log("random.txt");
  }
};

liri.run();
