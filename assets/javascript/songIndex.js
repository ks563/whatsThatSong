//An array that will be populated by the songs returned from the getSongByLyrics function
var songs = [];
//A function that takes a lyric sample as an argument and calls the audd api to get full songs
var getSongByLyrics = function(lyricSample){
    $.ajax({
        url: "https://api.audd.io/findLyrics/?q=" + lyricSample,
        method: "GET"
    }).then(function (response) {
        //resetting the songs array
        songs = [];
        console.log(response);
        //Grabbing 5 songs from the api call
        for (i = 0; i < 5; i++){
            //assigning a song object with the keys
            var song = {artist: "", title: "",lyrics: "" };
            //assigning the proper values to the keys
            song.artist = response.result[i].artist;
            song.title = response.result[i].title;
            song.lyrics = response.result[i].lyrics;
            //adding the song object to the songs array
            songs.push(song);
        }
        console.log(songs);
    });
}
