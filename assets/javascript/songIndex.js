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

            // song.mediaArr = JSON.parse(response.result[i].media);

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
    var lyricDiv = $("<div class=lyricDiv><h6>Artist: " + songs[ind].artist + "</h6><h6> Song: " + songs[ind].title + "</h6><p>" + songs[ind].lyrics + "</p>");
    $("#songresults").html(lyricDiv);
    $("#back-to-results").attr("style","display: visible");
});

$(document).on("click","#back-to-results", function(){
    $("#back-to-results").attr("style","display: none");
    resultsToDisplay();
});
