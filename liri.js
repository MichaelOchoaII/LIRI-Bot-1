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
    this.runCommand(this.command, this.args, false).then(function(results){
      console.log(results);
      liri.logOutput(liri.command, results);
    });

  },

  runCommand: function(command, args, recurse){
    return new Promise(function(resolve, reject){
      // console.log(command === "my-tweets");
        if(command === "my-tweets"){
          liri.myTweets().then(function(results){
            resolve(results);
          });
        }
        else if(command === "spotify-this-song"){
          liri.spotifyThisSong(args).then(function(results){
            resolve(results);
          });
        }
        else if(command === "movie-this"){
          liri.movieThis(args.replace(" ", "+")).then(function(results){
            resolve(results);
          });
        }
        else if(command === "do-what-it-says"){
          if(!recurse){
            liri.doWhatItSays();
            resolve("");
          }
          else{
            resolve("invalid command: cannot call do-what-it-says from within random.txt");
          }

        }
        else{
          resolve("invalid command: could not recognize command");
        }
    });
  },

  myTweets: function(){
    // console.log("Tweets");
    return new Promise(function(resolve, reject){
      var output = "";
      var client = new twitter(liri.keys.twitterKeys);
      client.get('statuses/user_timeline', function(error, tweets, response) {
        if(error){
          console.log(error);
          return;
        }
        for(var t = 0; t<Math.min(20, tweets.length);t++){
          // console.log(tweets[t].created_at+"\n"+tweets[t].text+"\n");
          output += tweets[t].created_at+"\n"+tweets[t].text+"\n";
        }
        resolve(output);
      });
    });
  },

  spotifyThisSong: function(song){
    if(!song){
      song = "The Sign";
    }
    return new Promise(function(resolve, reject){
      var spotify = new spotifyApi(liri.keys.spotifyKeys);
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
        resolve("Artist(s): " + artistlist + "\nTrack Name: " + resultTrack.name + "\nPreview URL: " + resultTrack.preview_url + "\nAlbum: " + resultTrack.album.name);
      })
      .catch(function(err) {
        console.log(error);
      });
  });
  },

  movieThis: function(movie){
    // console.log("movie");
    if(!movie){
      movie = "Mr.+Nobody";
    }
    return new Promise(function(resolve, reject){
      var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=40e9cece";
      request(queryUrl, function(error, response, body){
        if(!error && response.statusCode === 200){
          var movieinfo = JSON.parse(body);
          var imdbrating, rtrating;
          for(var r in movieinfo.Ratings){
            if(r.Source === "Internet Movie Database"){
              imdbrating = r.Value;
            }
            else if(r.Source === "Rotten Tomatoes"){
              rtrating = r.Value;
            }
          }
          resolve("Title: "+movieinfo.Title+"\n"+"Year: "+movieinfo.Year+"\n"+"IMDB Rating: "+imdbrating+"\nRotten Tomatoes Rating: "+rtrating+"\nCountry: "+movieinfo.Country+"\nLanguage: "+movieinfo.Language+"\nPlot: "+movieinfo.Plot+"\nActors: "+movieinfo.Actors);
        }
        else{
          console.log(error);
        }
      });
  });
  },

  doWhatItSays: function(){
    console.log("random.txt");
    fs.readFile("random.txt", "utf8", function(error, data){
      if(error){
        console.log(error);
        return;
      }
      console.log(data.split("\n"));
      var commandlist = data.split("\n");
      var promiselist = [];
      for(var c in commandlist){
        //ignore blank lines
        if(commandlist[c]){
          var currentCommand = commandlist[c].trim().split(",");
          promiselist.push(liri.runCommand(currentCommand[0], currentCommand[1], true));
        }
      }
      Promise.all(promiselist).then(function(values) {
        for(var v in values){
          console.log(values[v]);
          liri.logOutput(commandlist[v].trim(), values[v]);
        }
      });
    });
  },

  logOutput: function(command, output){
    fs.appendFile("log.txt", command+"\n---\n"+output+"\n---\n", function(err) {
      if (err) {
        console.log(err);
      }
      // else {
      //   console.log("Content Added!");
      // }
    });
  }


};

liri.run();


//note to self: make each function return the results to print, and use a callback to print and log? Might not work, because of single threading
