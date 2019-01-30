//The client's user name
var userName;
//an array so the client can access their saved songs
var songsSaved =[];
//initializing firebase
var config = {
    apiKey: "AIzaSyC5e4ymIF11OrkIB4nXEiJZ2dGJN09KTFU",
    authDomain: "whats-that-song-p1.firebaseapp.com",
    databaseURL: "https://whats-that-song-p1.firebaseio.com",
    projectId: "whats-that-song-p1",
    storageBucket: "whats-that-song-p1.appspot.com",
    messagingSenderId: "205305988183"
  };
firebase.initializeApp(config);
//root of our database
var database = firebase.database();
//a function that will create a new user in firebase and give them a directory in the database 
var signup = function(email, password){
    firebase.auth().createUserWithEmailAndPassword(email, password);
    //the name of the directory and username will be the user's email address before the '@' sign
    var splicedEmail = email.substring(0, email.indexOf("@"));
    var newUser = database.ref("/users").child(splicedEmail);
    //the user account is signed in and are given a directory for saved songs
    newUser.set({signedin: true, songsSaved: false});  
}
// a function that will sign in an existing user
var signin = function(email, password){
    firebase.auth().signInWithEmailAndPassword(email, password);
    
}
// a function that will siginout the currently logged in user
var signout = function(){
    firebase.auth().signOut();
}

//function that is called when the sign in state is changed
firebase.auth().onAuthStateChanged(function(user) {
    //the user is signed in
    if (user) {
        //grabbing all info about current user that is in the database
        var user = firebase.auth().currentUser
        //setting a variable client side that is equal to the value in the database
        userName = user.email
        userName = userName.substring(0, userName.indexOf("@"));
        //displaying the button that allows user to view their saved song 
        $("#view-saved").attr("style", "display: visible");
        database.ref("/users/" + userName).child("signedin").set(true);
        console.log(userName);
        //when the user is successfully signed in, we can close the modal
        $("#modalRegisterForm").modal("hide");
        $("#modalLoginForm").modal("hide");
    } else {
      database.ref("/users/" + userName).child("signedin").set(false);
    }
  });
//a database reference that points to the user directory 
database.ref("/users").on("value", function (snapshot) {
    //a reference to the saved songs array of the signed in user
    var songsSavedRef = snapshot.child(userName).child("songsSaved");
    //for every saved song, add its key value pairs to the client's saved song array
    songsSavedRef.forEach(function (childSnap) {
        console.log("child songs ", childSnap);
        songsSaved.push(childSnap.val());

    })
})
//a function that the client can use to save a song. 
var saveSong = function(song){
    //clearing the client's saved song array
    songsSaved = [];
    //the new song is given a directory where its key value pairs will be saved (key value pairs come from the aud.io  api call stored in the client earlier)
    var newSong =database.ref("/users/" + userName).child("songsSaved").child(song.title + "-" + song.artist);
    newSong.set(song)
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
    
            //this is used to format the lyrics into a nicer form
            var openB = "["
            song.lyrics = song.lyrics.replace(/\[/g,'<br>[');
            song.lyrics = song.lyrics.replace(/\]/g,']<br>');
            //this is used to highlight the lyric query in the returned lyrics where it shows up
            song.lyrics = song.lyrics.replace(new RegExp(query, 'g'), "<span class=queryFound>" + query + "</span>");
            
            try{
                song.mediaArr = JSON.parse(response.result[i].media);
            }
            catch(err){
                console.log(err.message);
                song.mediaArr = "";
            }

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
var savedToDisplay = function(){
    $("#inputLyrics").attr("style","display: none");
    $("#submit").attr("style","display: none");
    for (j = 0; j < songsSaved.length; j++){
        var songDiv = $("<div class='savedSong' data-ind='"+ j + "'>Artist: " + songsSaved[j].artist + " Song: " + songsSaved[j].title + "</div>");
        console.log(songDiv);
        $("#search-and-saved").append(songDiv);
    };
};
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
var ind;
$(document).on("click",".song",function(){
    ind = $(this).attr("data-ind");
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
    $("#save-song").attr("style","display: visible");
});
$(document).on("click",".savedSong", function(){
    $(".results-container").show();
    $(".record-container").hide();
    $("#view-saved").attr("style", "display: none");
    ind = $(this).attr("data-ind");
    $("#songresults").empty();
    for (k = 0; k < songsSaved[ind].mediaArr.length; k++)
    {
        if (songsSaved[ind].mediaArr[k].provider == "spotify"){
            var id = songsSaved[ind].mediaArr[k].native_uri.substring(14);
            spotifyPull(id);
        }
    }
    var lyricDiv = $("<div class=lyricDiv><h6>Artist: " + songsSaved[ind].artist + "</h6><h6> Song: " + songsSaved[ind].title + "</h6><p>" + songsSaved[ind].lyrics + "</p>");
    $("#songresults").html(lyricDiv);
});

$(document).on("click","#back-to-results", function(){
    $("#back-to-results").attr("style","display: none");
    $("#save-song").attr("style","display: none");
    resultsToDisplay();
});

$(document).on("click","#signupbutton",function(){
    var em = $("#signup-email").val().trim();
    var pass = $("#signup-pass").val().trim();
    signup (em, pass);
});

$(document).on("click","#loginbutton",function(){
    var em = $("#login-email").val().trim();
    var pass = $("#login-pass").val().trim();
    signin (em, pass);
});

$(document).on("click","#save-song", function(){
    saveSong(songs[ind]);
});
$(document).on("click","#view-saved", function(){
    savedToDisplay();
    $("#view-saved").attr("style", "display: none");
    $("#back-to-search").attr("style","display: visible");
});
$(document).on("click","#back-to-search", function(){
    $("#search-and-saved").empty();
    $("#inputLyrics").attr("style","display: visible");
    $("#submit").attr("style","display: visible");
    $("#view-saved").attr("style", "display: visible");
    $("#back-to-search").attr("style","display: none");
});