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
            var song = {artist: "", title: "",lyrics: "" , mediaString: "", mediaArray: [], spotify: null, itunes: null};
            //assigning the proper values to the keys
            song.artist = response.result[i].artist;
            song.title = response.result[i].title;
            song.lyrics = response.result[i].lyrics;
            song.mediaString = response.result[i].media;
            song.mediaArray = song.mediaString.split("},");
            song.altMediaString = response.result[i].media[1,(response.result[i].media-1)];
            song.spotify = response.result[i].media[2];
            song.itunes = response.result[i].media[1];
            //adding the song object to the songs array
            songs.push(song);
        }
        console.log(songs);
    });
}
