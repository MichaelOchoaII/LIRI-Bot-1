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
    //all args after the command are combined into one list and joined by spaces, for use later
    if(process.argv.length >2){
      this.args = process.argv.slice(3, process.argv.length).join(" ");
    }
    //run a command, and log the results when it finishes
    this.runCommand(this.command, this.args, false).then(function(results){
      console.log(results);
      liri.logOutput(liri.command+"\n---\n"+results+"\n---\n");
    });

  },

  runCommand: function(command, args, recurse){
    //returns a promise for outputting results
    return new Promise(function(resolve, reject){
      // each command function returns a promise to ensure that the information is retrieved before it is returned
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
          //the recurse conditional makes sure that do-what-it-says isn't run from random.txt, which, I haven't tested it, but I think it would just be a neverending nightmare of recursion. So, that crisis is averted.
          if(!recurse){
            liri.doWhatItSays();
            resolve("");
          }
          else{
            resolve("ALERT: Command not executed; cannot call do-what-it-says from within random.txt");
          }

        }
        else{
          //if the command isn't recognized, the promise resolves with an alert for an unknown command. A reject may interfere with other commands being run, if it rejects in do-what-it-says
          resolve("ALERT: Command not executed; could not recognize command");
        }
    });
  },

  myTweets: function(){
    return new Promise(function(resolve, reject){
      var output = "";
      var client = new twitter(liri.keys.twitterKeys);
      client.get('statuses/user_timeline', function(error, tweets, response) {
        if(error){
          console.log(error);
          return;
        }
        //go through tweets, to a maximum of 20 but not more tweets than there are on the account)
        for(var t = 0; t<Math.min(20, tweets.length);t++){
          output += tweets[t].created_at+"\n"+tweets[t].text+"\n";
        }
        //remove the trailing newline
        output = output.slice(0,output.length-1);
        resolve(output);
      });
    });
  },

  spotifyThisSong: function(song){
    // if no song is specified, defaults to The Sign
    if(!song){
      song = "The Sign Ace of Base";
    }
    return new Promise(function(resolve, reject){
      var spotify = new spotifyApi(liri.keys.spotifyKeys);
      spotify.search({ type: 'track', query: song })
      .then(function(response) {
        // grabbing the first search result, which is (hopefully) the desired result
        var resultTrack = response.tracks.items[0];
        var artistlist = [];
        //there may be multiple artists (spotify returns a list), so I grab them all
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
    if(!movie){
      movie = "Mr.+Nobody";
    }
    return new Promise(function(resolve, reject){
      var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey="+liri.keys.omdbkey;
      request(queryUrl, function(error, response, body){
        //if there's no error and the response is a success...
        if(!error && response.statusCode === 200){
          var movieinfo = JSON.parse(body);
          //the ratings are in a list of objects
          var imdbrating, rtrating;
          for(var r in movieinfo.Ratings){
            if(movieinfo.Ratings[r].Source === 'Rotten Tomatoes'){
              rtrating = movieinfo.Ratings[r].Value;
            }
            else if(movieinfo.Ratings[r].Source === 'Internet Movie Database'){
              imdbrating = movieinfo.Ratings[r].Value;
            }
          }
          //the imdb rating can appear in two places, so just to be safe, if the first isn't found, the script checks the second as well.
          if(!imdbrating){
            imdbrating = movieinfo.imdbRating + "/10";
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
    fs.readFile("random.txt", "utf8", function(error, data){
      if(error){
        console.log(error);
        return;
      }
      // parse each line separately
      var commandlist = data.split("\n");
      var promiselist = [];
      for(var c in commandlist){
        //ignore blank lines
        if(commandlist[c]){
          var currentCommand = commandlist[c].trim().split(",");
          //the promises are accumulated in a list to be cycled through once they all finish
          promiselist.push(liri.runCommand(currentCommand[0], currentCommand[1], true));

        }
      }
      var output = "";
      //Promise.all waits for all the promises to resolve before moving on to log values
      Promise.all(promiselist).then(function(values) {
        for(var v in values){
          console.log(values[v]);
          //I gather all the output into one variable and write it at once to keep the commands' output in the same order as their execution
          output += commandlist[v].trim()+"\n---\n"+values[v]+"\n---\n";
        }
        liri.logOutput(output);
      });
    });
  },

  logOutput: function(output){
    fs.appendFile("log.txt", output, function(err) {
      if (err) {
        console.log(err);
      }
    });
  }

};

liri.run();
