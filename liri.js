require("dotenv").config();
var keys = require("./keys.js"); // Import Spotify Keys
var Spotify = require('node-spotify-api'); // Imprort node-spotify module
var moment = require('moment'); // import moment js for time
var fs = require('fs')

var spotify = new Spotify(keys.spotify);
var axios = require("axios")

var commandType = process.argv[2];
var searchTerm = process.argv.slice(3).join(" ");

function searchLiri() {
    switch (commandType) {
        case "concert-this":
            if (searchTerm.length === 0) { searchTerm = "ja rule" }
            console.log("Searching Bands in Town for " + searchTerm)
            console.log("-------------------------------------\n")
            bandSearch(searchTerm);
            break;
        case "spotify-this-song":
            if (searchTerm.length === 0) { searchTerm = "The Sign by Ace of Base" }

            console.log("Searching Spotify for " + searchTerm)
            console.log("-------------------------------------\n")
            songSearch(searchTerm);
            break;

        case "movie-this":
            if (searchTerm.length === 0) { searchTerm = "Mr Nobody" }

            console.log("Searching OMDB for " + searchTerm)
            console.log("-------------------------------------\n")
            movieSearch(searchTerm);
            break;

        case "do-what-it-says":
            console.log("searching the data from the random.txt file")
            fs.readFile("./random.txt", "utf8", function (err, data) {
                if (err) throw err;
                var resData = data.split(",")
                commandType = resData[0];
                searchTerm = resData[1]
                searchLiri();
            })
            break;
        default:
            console.log("Im sorry, I dont recognize that command. ")
            console.log(
                "\nHere are the command line arguments you can use: " +
                "\n* concert-this 'band name'" +
                "\n* spotify-this-song 'song name'" +
                "\n* movie-this 'Movie name'"
            )
            break
    }
}

searchLiri();
//----------------------------------------------------------//
// A function that uses the BandsInTown API to to search for an artist andfind their next event to display 
// Name of the venue
// Venue location
// Date of the Event(use moment to format this as "MM/DD/YYYY")

function bandSearch(artist) {
    //band in town query url
    var queryUrl = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp&date=upcoming";

    // fetch info with axios
    axios.get(queryUrl).then(function (response) {
    
        var responseData = response.data;
        for (i = 0; i < responseData.length; i++) {
            concertTime = moment(responseData[i].datetime, "YYYY-MM-DDTHH:mm:ss").format("MM/DD/YYYY");
            var venueInfo = [
                "Venue Name: " + responseData[i].venue.name + "\n",
                "Location: " + responseData[i].venue.city + ", " + responseData[i].venue.region + ", " + responseData[i].venue.country + "\n",
                "Date: " + concertTime + "\n"
            ].join("");

            logText(venueInfo);
            console.log(venueInfo + "\n-------------------------------------\n");
        }
    })
}


//----------------------------------------------------------//
//Query the spotify API to provide song information
function songSearch(song) {
    spotify.search({ type: 'track', query: song }, function (err, response) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        var songsData = response.tracks.items;
        // console.log(songsData[0])

        for (i = 0; i < songsData.length; i++) {

            var songInfo = [
                "Artist: " + songsData[i].artists[0].name + "\n",
                "Song: " + songsData[i].name + "\n",
                "Preview Link: " + songsData[i].preview_url + "\n",
                "Album: " + songsData[i].album.name + "\n"
            ].join("");

            logText(songInfo);
            console.log(songInfo + "\n\n-------------------------------------\n")
        }


    })

}

//----------------------------------------------------------//
// Function that queries the OMDB Api to provide movie info
function movieSearch(movie) {

    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";
    axios.get(queryUrl).then(function (response) {
        var responseData = response.data;

        var movieInfo = [

            "Title: " + responseData.Title + "\n",
            "Year: " + responseData.Year + "\n",
            "IMDB Rating: " + responseData.Ratings[0].Value + "\n",
            "Rotten Tomatoes Rating: " + responseData.Ratings[1].Value + "\n",
            "Country: " + responseData.Country + "\n",
            "Language: " + responseData.Language + "\n",
            "Plot Summary: " + responseData.Plot + "\n",
            "Actors: " + responseData.Actors + "\n"

        ].join("");

        logText(movieInfo);
        //Console log the movie info array
        console.log(movieInfo + "\n-------------------------------------\n");

    });
}

//Function to log text from the search functions
function logText(info){
    fs.appendFile("log.txt", info, function(err){
        if(err) throw err;
    });
}