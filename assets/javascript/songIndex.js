//The client's user name
var userName = "";
//an array so the client can access their saved songs
var songsSaved = [];
//initializing firebase
var validChars = "abcdefghijklmnopqrstuvwxyz0123456789"
//userNames
var userNames = []
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
var signup = function (email, password, disName) {
    var validEntry = true;
    //this ensures that only alphanumeric chars have been used for the username
    for (o = 0; o < disName.length; o++) {
        if (validChars.indexOf(disName[o]) === -1) {
            validEntry = false;
        }
    }
    //this checks to see if the username is already in use
    if (!userNames.includes(disName) && validEntry) {
        //attempt to create a user account with provided info
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function () {
            //if there were no errors on firebase's end we give the account a username
            var user = firebase.auth().currentUser;

            user.updateProfile({
                displayName: disName
            });
            //setting the client user name
            userName = disName
            console.log("creating user: ", userName);
            //the user account is given a directory in the database
            var newUser = database.ref("/users").child(disName);
            //the user account is signed in and are given a directory for saved songs
            newUser.set({ signedin: true, songsSaved: false });
        }).catch(function (error) {
            $("#signup-err").text(error.message);
            console.log("firebase error");
        });
        //the name of the directory and username will be the user's email address before the '@' sign
        // var splicedEmail = email.substring(0, email.indexOf("@")).replace(/\./g, "");
        // console.log("spliced email ",splicedEmail);
        // // splicedEmail = splicedEmail;
        // console.log("no periods",splicedEmail);
        // var newUser = database.ref("/users").child(splicedEmail);
        // //the user account is signed in and are given a directory for saved songs
        // newUser.set({signedin: true, songsSaved: false});  
    }
    else {
        if (validEntry) {
            $("#signup-err").text("Sorry that username is already taken!");
        }
        else {
            $("#signup-err").text("Sorry usernames can only include characters A-Z and 0-9");
        }

    }
}
// a function that will sign in an existing user
var signin = function (email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password);

}
// a function that will siginout the currently logged in user
var signout = function () {
    database.ref("/users/" + userName).child("signedin").set(false);
    firebase.auth().signOut();
    location.reload();
}

//function that is called when the sign in state is changed
firebase.auth().onAuthStateChanged(function (userCurr) {
    //the user is signed in
    if (userCurr) {
        //grabbing all info about current user that is in the database
        // var userCurr = firebase.auth().currentUser;
        console.log(userCurr);
        //setting a variable client side that is equal to the value in the database
        if (userName === "") {
            userName = userCurr.displayName;
            database.ref("/users/" + userName).child("signedin").set(true);
        }

        //getting the value of everything before the @ in the email and removing the periods 
        // userName = userName.substring(0, userName.indexOf("@")).replace(/\./g, "");
        //displaying the button that allows user to view their saved song 
        $("#view-saved").attr("style", "display: visible");

        //when the user is successfully signed in, we can close the modal
        $("#modalRegisterForm").modal("hide");
        $("#modalLoginForm").modal("hide");
        $("#log-con").attr("style", "display: none");
        $("#logged-con").attr("style", "display: visible");
        $("#logged-name").text("Welcome " + userName);
    }
    //typically trigged when a user logs out 
    else {
        if (userName != "") {
            database.ref("/users/" + userName).child("signedin").set(false);
            songsSaved = [];
            userName = "";
        }
        $("#log-con").attr("style", "display: visible");
        $("#logged-con").attr("style", "display: none");
        $("#view-saved").attr("style", "display: none");
    }
});
//a database reference that points to the user directory 
database.ref("/users").on("value", function (snapshot) {
    userNames = []
    snapshot.forEach(function (child) {
        userNames.push(child.key);
    });
    if (userName != "" && userName != null) {
        songsSaved = []
        console.log("getting songs for ", userName);
        //a reference to the saved songs array of the signed in user
        var songsSavedRef = snapshot.child(userName).child("songsSaved");
        //for every saved song, add its key value pairs to the client's saved song array
        console.log("saving song");
        songsSavedRef.forEach(function (childSnap) {
            console.log("child songs ", childSnap);
            songsSaved.push(childSnap.val());
        });
    }

})
//a function that the client can use to save a song. 
var saveSong = function (song) {
    //clearing the client's saved song array
    songsSaved = [];
    //directories cannot have certain characters, so they will be removed from the string if necesarry
    var title = validator(song.title);
    var artist = validator(song.artist);
    //the new song is given a directory where its key value pairs will be saved (key value pairs come from the aud.io  api call stored in the client earlier)
    var newSong = database.ref("/users/" + userName).child("songsSaved").child(title + "-" + artist);
    newSong.set(song)
    $("#save-song").attr("style", "display: none");
}

//An array that will be populated by the songs returned from the getSongByLyrics function
var songs = [];

//A function that takes a lyric sample as an argument and calls the audd api to get full songs
var getSongByLyrics = function (query) {
    $.ajax({
        url: "https://api.audd.io/findLyrics/?api_token=ae85fce702c0f38597547a5b49958fac&q=" + query,
        method: "GET"
    }).then(function (response) {
        //resetting the songs array
        songs = [];
        console.log(response);
        //Grabbing 5 songs from the api call
        $("#loading-songs").hide();
        for (i = 0; i < 5; i++) {
            //assigning a song object with the keys
            var song = { artist: "", title: "", lyrics: "", lyricsHighlight: "", mediaArr: [], spotify: null, itunes: null, saved: false };
            //assigning the proper values to the keys
            song.artist = response.result[i].artist;
            song.title = response.result[i].title;
            song.lyrics = response.result[i].lyrics;

            for (n = 0; n < songsSaved.length; n++) {
                if (song.title === songsSaved[n].title && song.artist === songsSaved[n].artist) {
                    song.saved = true;
                }
            }

            //this is used to format the lyrics into a nicer form
            var openB = "["
            song.lyrics = song.lyrics.replace(/\[/g, '<br>[');
            song.lyrics = song.lyrics.replace(/\]/g, ']<br>');
            //this is used to highlight the lyric query in the returned lyrics where it shows up
            song.lyricsHighlight = song.lyrics.replace(new RegExp(query, 'g'), "<span class=queryFound>" + query + "</span>");

            try {
                song.mediaArr = JSON.parse(response.result[i].media);
            }
            catch (err) {
                console.log(err.message);

            }
            if (song.mediaArr.length === 0) {
                song.mediaArr = "unabletoparse";
            }

            //adding the song object to the songs array
            songs.push(song);
        }
        console.log(songs);
        resultsToDisplay();
    });
}
//a function that will display the results of the ajax call to the dom
var resultsToDisplay = function () {
    $("#songresults").empty();
    console.log("i have been called");
    for (j = 0; j < songs.length; j++) {
        var songDiv = $("<div class='song' data-ind='" + j + "'>Artist: " + songs[j].artist + " Song: " + songs[j].title + "</div>");
        console.log(songDiv);
        $("#songresults").append(songDiv);
    }
}
//a function that will display the logged in user's saved songs
var savedToDisplay = function () {
    $("#inputLyrics").attr("style", "display: none");
    $("#submit").attr("style", "display: none");
    $("#search-and-saved").empty();
    for (j = 0; j < songsSaved.length; j++) {
        var songDiv = $("<div class='savedSong' data-ind='" + j + "'>Artist: " + songsSaved[j].artist + " Song: " + songsSaved[j].title + "</div>");
        $("#search-and-saved").append(songDiv);
    };
};
//this function is used to remove any characters that cannot be used in a directory name
var validator = function (toValid) {
    var invalidChars = ".#$[]"
    var validated;
    validated = toValid.replace(/\./g, "");
    validated = validated.replace(/\#/g, "");
    validated = validated.replace(/\$/g, "S");
    validated = validated.replace(/\[/g, "");
    validated = validated.replace(/\]/g, "");
    console.log("validated string: ", validated);
    return validated;
}
//pulling spotify info with it's api
var spotifyPull = function (trackID) {
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
    }).then(function (response) {
        console.log(response);
    });
}
//a function that is called to submit the lyric sample to the ajax call 
$(document).on("click", "#submit", function (event) {
    $("#songresults").empty();
    $("#loading-songs").show();
    $("#back-to-results").attr("style", "display: none");
    $("#save-song").attr("style", "display: none");
    event.preventDefault();
    var lyricSample = $("#inputLyrics").val();
    console.log(lyricSample);
    lyricSample = lyricSample.trim();

    if (lyricSample != "") {
        getSongByLyrics(lyricSample);
    }
});
var ind;
//when a song is clicked it's info will be displayed in the results div
$(document).on("click", ".song", function () {
    //getting the data attr from the song that was clicked on 
    ind = $(this).attr("data-ind");
    //emptying the song results div
    $("#songresults").empty();
    //creating divs for media links
    var spotifyLink = $("<a id='spotify-link' target='blank'>Spotify</a>");
    var youtubeLink = $("<a id='youtube-link' target='blank'>Youtube</a>");
    var mediaLinks = $("<div id='media-links'></div>")
    //for each media object in the song object, find the spotify id and call the spotify api with it 
    for (k = 0; k < songs[ind].mediaArr.length; k++) {
        if (songs[ind].mediaArr[k].provider == "spotify") {
            spotifyLink.attr("href", songs[ind].mediaArr[k].url);
            mediaLinks.append(spotifyLink);
        }
        if (songs[ind].mediaArr[k].provider == "youtube") {
            youtubeLink.attr("href", songs[ind].mediaArr[k].url);
            mediaLinks.append(youtubeLink);
        }
    }
    //append the results to the dom
    var lyricDiv = $("<div class=lyricDiv><h6>Artist: " + songs[ind].artist + "</h6><h6> Song: " + songs[ind].title + "</h6><p>" + songs[ind].lyricsHighlight + "</p>");
    //hide and show the relevant buttons
    $("#songresults").html(lyricDiv);
    $("#songresults").prepend(mediaLinks);

    $("#back-to-results").attr("style", "display: visible");
    if (!songs[ind].saved) {
        $("#save-song").attr("style", "display: visible");
    }
    else {
        $("#save-song").attr("style", "display: none");
    }
});
//this function performs similarly to the one above, but is called when saved songs are clicked on
$(document).on("click", ".savedSong", function () {
    $(".results-container").show();
    $(".record-container").hide();
    $("#view-saved").attr("style", "display: none");
    ind = $(this).attr("data-ind");
    //emptying song results div
    $("#songresults").empty();
    //creating divs for media links
    var spotifyLink = $("<a id='spotify-link' target='blank'>Spotify</a>");
    var youtubeLink = $("<a id='youtube-link' target='blank'>Youtube</a>");
    var mediaLinks = $("<div id='media-links'></div>")
    //for each media object in the song
    for (k = 0; k < songsSaved[ind].mediaArr.length; k++) {
        //find the spotify url
        if (songsSaved[ind].mediaArr[k].provider == "spotify") {
            spotifyLink.attr("href", songsSaved[ind].mediaArr[k].url);
            mediaLinks.append(spotifyLink);
        }
        //find the youtube url
        if (songsSaved[ind].mediaArr[k].provider == "youtube") {
            youtubeLink.attr("href", songsSaved[ind].mediaArr[k].url);
            mediaLinks.append(youtubeLink);
        }
    }
    //append lyrics
    var lyricDiv = $("<div class=lyricDiv><h6>Artist: " + songsSaved[ind].artist + "</h6><h6> Song: " + songsSaved[ind].title + "</h6><p>" + songsSaved[ind].lyrics + "</p>");
    $("#songresults").html(lyricDiv);
    $("#songresults").prepend(mediaLinks);
    $("#save-song").attr("style", "display: none");
    $("#back-to-results").attr("style", "display: none");
});
//repopulates the results div with the most recent search results
$(document).on("click", "#back-to-results", function () {
    $("#back-to-results").attr("style", "display: none");
    $("#save-song").attr("style", "display: none");
    resultsToDisplay();
});
//a function that will allow the user to sign up using their email and password
$(document).on("click", "#signupbutton", function () {
    var em = $("#signup-email").val().trim();
    var pass = $("#signup-pass").val().trim();
    var name = $("#signup-user").val().trim()
    signup(em, pass, name);
});
//loginbutton 
$(document).on("click", "#loginbutton", function () {
    var em = $("#login-email").val().trim();
    var pass = $("#login-pass").val().trim();
    signin(em, pass);
});
//a button that will save the invoking song
$(document).on("click", "#save-song", function () {
    saveSong(songs[ind]);
    songs[ind].saved = true;
});
//button that allos user to view their saved songs
$(document).on("click", "#view-saved", function () {
    savedToDisplay();
    $("#view-saved").attr("style", "display: none");
    $("#back-to-search").attr("style", "display: visible");
});
//button that allows user to return to search after looking at their saved songs
$(document).on("click", "#back-to-search", function () {
    $("#search-and-saved").empty();
    $("#inputLyrics").attr("style", "display: visible");
    $("#submit").attr("style", "display: visible");
    $("#view-saved").attr("style", "display: visible");
    $("#back-to-search").attr("style", "display: none");
});
//a button that allows users to sign out of their account
$(document).on("click", "#logout", function () {
    signout()
})