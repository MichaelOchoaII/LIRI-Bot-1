var request = require("request");
var twitter = require("twitter");
//https://github.com/thelinmichael/spotify-web-api-node
var spotifyApi = require("node-spotify-api");
var fs = require("fs");

var liri = {
  command: "",
  args: [],
  keys: require("./keys.js"),

  run: function(){
    // console.log("START");
    this.command = process.argv[2].toLowerCase();
    if(process.argv.length >2){
      this.args = process.argv.slice(3, process.argv.length).join(" ");
    }
    this.runCommand(this.command, this.args, false);

  },

  runCommand: function(command, args, recurse){
    console.log(command);
    if(command === "my-tweets"){
      this.myTweets();
    }
    if(command === "spotify-this-song"){
      this.spotifyThisSong(this.args);
    }
    if(command === "movie-this"){
      this.movieThis(this.args.replace(" ", "+"));
    }
    if(command === "do-what-it-says"){
      this.doWhatItSays();
    }
  },

  myTweets: function(){
    // console.log("Tweets");
    var client = new twitter(this.keys.twitterKeys);
    client.get('statuses/user_timeline', function(error, tweets, response) {
      if(error){
        console.log(error);
        return;
      }
      for(var t = 0; t<Math.min(20, tweets.length);t++){
        console.log(tweets[t].created_at+"\n"+tweets[t].text+"\n");
      }
    });
  },

  spotifyThisSong: function(song){
    // console.log("spotify");
    var spotify = new spotifyApi(this.keys.spotifyKeys);
    spotify.search({ type: 'track', query: song })
    .then(function(response) {
      // console.log(response.tracks.items[0]);
      var resultTrack = response.tracks.items[0];
      var artistlist = [];
      for(var a in resultTrack.artists){
        artistlist.push(resultTrack.artists[a].name);
      }
      if(artistlist.length > 0){
        artistlist = artistlist.join(", ");
      }

      console.log(artistlist);
      console.log(resultTrack.name);
      console.log(resultTrack.preview_url);
      console.log(resultTrack.album.name);
    })
    .catch(function(err) {
      console.log(error);
    });
  },

  movieThis: function(movie){
    // console.log("movie");
    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=40e9cece";
    request(queryUrl, function(error, response, body){
      if(!error && response.statusCode === 200){
        var movieinfo = JSON.parse(body);
        console.log("Title: "+movieinfo.Title);
        console.log("Year: "+movieinfo.Year);
        var imdbrating, rtrating;
        for(var r in movieinfo.Ratings){
          if(r.Source === "Internet Movie Database"){
            imdbrating = r.Value;
          }
          else if(r.Source === "Rotten Tomatoes"){
            rtrating = r.Value;
          }
        }
        console.log("IMDB Rating: "+imdbrating);
        console.log("Rotten Tomatoes Rating: "+rtrating);
        console.log("Country: "+movieinfo.Country);
        console.log("Language: "+movieinfo.Language);
        console.log("Plot: "+movieinfo.Plot);
        console.log("Actors: "+movieinfo.Actors);
      }
      else{
        console.log(error);
      }
    });
  },

  doWhatItSays: function(){
    console.log("random.txt");
    // fs.readFile("random.txt", "utf8", function(error, data){
    //
    // });
  }
};

liri.run();
