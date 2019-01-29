var config = {
    apiKey: "AIzaSyC5e4ymIF11OrkIB4nXEiJZ2dGJN09KTFU",
    authDomain: "whats-that-song-p1.firebaseapp.com",
    databaseURL: "https://whats-that-song-p1.firebaseio.com",
    projectId: "whats-that-song-p1",
    storageBucket: "whats-that-song-p1.appspot.com",
    messagingSenderId: "205305988183"
  };
firebase.initializeApp(config);

var database = firebase.database();
var signup = function(email, password){
    firebase.auth().createUserWithEmailAndPassword(email, password);
}
//An array that will be populated by the songs returned from the getSongByLyrics function
var songs = [];
//A function that takes a lyric sample as an argument and calls the audd api to get full songs
var getSongByLyrics = function(query){
    $.ajax({
        url: "https://api.audd.io/findLyrics/?api_token=ae85fce702c0f38597547a5b49958fac&q=" + query,
        method: "GET"
    }).then(function (response) {
        //resetting the songs array
        songs = [];
        console.log(response);
        //Grabbing 5 songs from the api call
        for (i = 0; i < 5; i++){
            //assigning a song object with the keys
            var song = {artist: "", title: "",lyrics: "" , mediaArr: [], spotify: null, itunes: null};
            //assigning the proper values to the keys
            song.artist = response.result[i].artist;
            song.title = response.result[i].title;
            song.lyrics = response.result[i].lyrics;
            console.log(typeof song.lyrics);
            var openB = "["
            song.lyrics = song.lyrics.replace(/\[/g,'<br>[');
            song.lyrics = song.lyrics.replace(/\]/g,']<br>');
            // var regex = /"" + query + ""/g
            song.lyrics = song.lyrics.replace(new RegExp(query, 'g'), "<span class=queryFound>" + query + "</span>");
            console.log(song.lyrics);

            song.mediaArr = JSON.parse(response.result[i].media);

            //adding the song object to the songs array
            songs.push(song);
        }
        console.log(songs);
        resultsToDisplay();
    });
}
var resultsToDisplay = function(){
    $("#songresults").empty();
    console.log("i have been called");
    for (j = 0; j < songs.length; j++){
        var songDiv = $("<div class='song' data-ind='"+ j + "'>Artist: " + songs[j].artist + " Song: " + songs[j].title + "</div>");
        console.log(songDiv);
        $("#songresults").append(songDiv);
    }
}
var spotifyPull = function(trackID){
    // $.ajax({
    //     url: "https://accounts.spotify.com/api/token?grant_type=client_credentials",
    //     headers: {
    //         'Authorization': 'Basic ' + "a42da72627694428a93be7c10a4b1eca:2b7798d898df4ddd92f549f0da7a11f1"
    //     },
    //     method: "POST"
    // }).then(function (response){
    //     console.log("token is: ", response);
    // });

    $.ajax({
        url: "https://api.spotify.com/v1/tracks/" + trackID,
        headers: {
            'Authorization': 'Bearer ' + "BQAxKuhgyoYWOVjxsBo-g9zK14LBrzghFtYYVPHEQV5o72FiLfIZ-lUDXk_6pOXmuvGvGTIgmgI_wczd9QrwBCDmZHJEoMwgcV4t6qGPQSgAHdS4vsx7TP_3qfvRqqMyStlP_k023z5iOMqswYA3_w"
        },
        method: "GET"
    }).then(function (response){
        console.log(response);
    });
}
$(document).on("click","#submit",function(event){
    event.preventDefault();
    var lyricSample = $("#inputLyrics").val();
    console.log(lyricSample);
    lyricSample= lyricSample.trim();

    if(lyricSample !=""){
        getSongByLyrics(lyricSample);
        
    }
});

$(document).on("click",".song",function(){
    var ind = $(this).attr("data-ind");
    $("#songresults").empty();
    for (k = 0; k < songs[ind].mediaArr.length; k++)
    {
        if (songs[ind].mediaArr[k].provider == "spotify"){
            var id = songs[ind].mediaArr[k].native_uri.substring(14);
            spotifyPull(id);
        }
    }
    var lyricDiv = $("<div class=lyricDiv><h6>Artist: " + songs[ind].artist + "</h6><h6> Song: " + songs[ind].title + "</h6><p>" + songs[ind].lyrics + "</p>");
    $("#songresults").html(lyricDiv);
    $("#back-to-results").attr("style","display: visible");
});

$(document).on("click","#back-to-results", function(){
    $("#back-to-results").attr("style","display: none");
    resultsToDisplay();
});
