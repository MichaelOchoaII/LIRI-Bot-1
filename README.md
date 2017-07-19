# LIRI-Bot
A node command line app to retrieve information using the Twitter, Spotify, and OMDB APIs. The information retrieved will be logged to the console as well as a text file `log.txt`

Liri accepts four commands: `spotify-this-song`, `my-tweets`, `movie-this`, and `do-what-it-says`.

## spotify-this-song ##
The `spotify-this-song` command will take any arguments following the command and log the information for the first song from the search results for that title. It will log the artist(s), the name of the track, the URL for a preview on Spotify, and the album. If no arguments are supplied, it will log the information for "The Sign" by Ace of Base.

For example, `node liri spotify-this-song favorite song` will run a Spotify API search for songs with the title "Favorite Song" and log the first result.

## my-tweets ##
The `my-tweets` command will log the 20 most recent tweets from a twitter account. This requires the API keys for the twitter account that Liri should read from. Each tweet's content and the time it was created are logged.

For example, `node liri my-tweets` will log up to 20 tweets from the account.

## movie-this ##
The `movie-this` command will take any arguments following the command and log the information for the first movie from the search results for that title. It will log the title, the release year, the IMDB rating, the Rotten Tomatoes rating, the country of origin, the language, a brief plot snippet, and the actors. If no arguments are supplied, it will log the information for "Mr. Nobody".

For example, `node liri spotify-this-song favorite movie` will run a OMDB API search for movies with the title "Favorite Movie" and log the first result.

## do-what-it-says  ##
The `do-what-it-says` command will read the `random.txt` file and run the commands on each line, and log their output in the order they're listed in the file.

The `do-what-it-says` command cannot run itself. If `do-what-it-says` is in `random.txt`, the other commands will run, but instances of the `do-what-it-says` command will not run.
