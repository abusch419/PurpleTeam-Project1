// global variables
let trackListString = "";
let playlistId;
let access_token;
let tracklist;
let artistId;

// main spotify search function called when user clicks show button generated from BIT
function searchSpotify(token, searchParams, arrayLength, lastPass) {
  // clear tracklist array
  tracklist = [];
  console.log(searchParams, lastPass);
  console.log("trackliststring= ", trackListString, "tracklist= ", tracklist);

  // spotify api search artist get request, response is an object and we grab the id in order to continue
  searchArtist(searchParams, token)
    .then(function(response, err) {
      console.log(response);
      console.log(response.artists.items[0].id);
      artistId = response.artists.items[0].id;
      // calls getTopTracks function which generates an array of top tracks for artist
      return getTopTracks(artistId, token);
    })
    .then(function(res, err) {
      console.log(res, arrayLength);
      // for loop that iterates through the spotify top tracks array and pushes tracks into our tracklist var
      for (let i = 0; i < res.tracks.length; i++) {
        tracklist.push(res.tracks[i].id);
      }
      // if we are done adding tracks to the array then we shuffle tracks and if array length is larger than 100 we narrow using splice meathod
      if (lastPass) {
        tracklist = shuffle(tracklist);
        if (tracklist.length > 99) {
          tracklist.splice(99);
        }
        console.log("shuffle: ", tracklist);
        // this loop takes final tracklist array and converts to a string with concatinated text required for sportify api post request
        for (let l = 0; l < tracklist.length; l++) {
          trackListString += `spotify:track:${tracklist[l]},`;
        }
      }
      // i <3 console.log
      console.log("tracklist var: ", tracklist);
      console.log(trackListString);
    });
}

// this function is called once we have a finalized tracklist
function makeFinalPlaylist() {
  token = access_token;
  getUser(token)
    .then(function(res, err) {
      const userId = res.id;
      console.log("getuser");
      // This function creates a new playlist called SoundCheck Playlist for spotify user logged in
      return createPlaylist(userId, token);
    })
    .then(function(res, err) {
      console.log("create playlist:", res.id);
      playlistId = res.id;
      console.log("create playlist" + token);
      console.log(playlistId);
      // This funtion loads out tracklist into the newly generated playlist
      return updatePlaylist(res.id, trackListString, token);
    })
    .then(function() {
      console.log("renderplaylist");
      // This function renders the playlist to the DOM
      renderPlaylist(playlistId);
    })
    .then(function() {
      // Clear tracklist string 
      trackListString = "";
    });
}

//////////// Function Definitions /////////////////////

// Search artist spotify get request
function searchArtist(searchParams, token) {
  return $.ajax({
    url:
      "https://api.spotify.com/v1/search?q=" +
      searchParams +
      "&" +
      "type=artist",
    method: "GET",
    headers: {
      Authorization: "Bearer " + token
    }
  });
}

// Get top tracks of artist
function getTopTracks(artistId, token) {
  return $.ajax({
    url:
      "https://api.spotify.com/v1/artists/" +
      artistId +
      "/top-tracks?country=us",
    method: "GET",
    headers: {
      Authorization: "Bearer " + token
    }
  });
}

// Get user id
function getUser(token) {
  return $.ajax({
    url: "https://api.spotify.com/v1/me",
    method: "GET",
    headers: {
      Authorization: "Bearer " + token
    }
  });
}

// create new SoundCheck Playlist
function createPlaylist(userId, token) {
  return $.ajax({
    url: "https://api.spotify.com/v1/users/" + userId + "/playlists",
    method: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: JSON.stringify({
      name: "SoundCheck Playlist"
    })
  });
}

// shuffle array to generate an array of random numbers. This way each crystal has a unique number (found this online :D)
function shuffle(array) {
  var i = 0,
    j = 0,
    temp = null;

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// add tracks to playlist
function updatePlaylist(playlistId, trackListString, token) {
  return $.ajax({
    url:
      "https://api.spotify.com/v1/playlists/" +
      playlistId +
      "/tracks?" +
      "uris=" +
      trackListString,
    method: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: JSON.stringify({
      name: "Mic Check Playlist"
    })
  });
}

// render playlist to DOM
function renderPlaylist(playlistId) {
  console.log("populating playlist:", playlistId);
  $("#musicDiv").append(
    `<iframe src="https://open.spotify.com/embed/playlist/${playlistId}" width="300" height="600" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`
  );
}

//////////////// Bearer Token //////////////////////////////////////////////////////////////
(function() {
  var stateKey = "spotify_auth_state";
  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ((e = r.exec(q))) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
  /**
   * Generates a random string containing numbers and letters
   * @param  {number} length The length of the string
   * @return {string} The generated string
   */
  function generateRandomString(length) {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  var userProfileSource = document.getElementById("user-profile-template")
      .innerHTML,
    userProfileTemplate = Handlebars.compile(userProfileSource),
    userProfilePlaceholder = document.getElementById("user-profile");
  (oauthSource = document.getElementById("oauth-template").innerHTML),
    (oauthTemplate = Handlebars.compile(oauthSource)),
    (oauthPlaceholder = document.getElementById("oauth"));
  var params = getHashParams();
  (access_token = params.access_token),
    (state = params.state),
    (storedState = localStorage.getItem(stateKey));
  if (access_token && (state == null || state !== storedState)) {
    alert("There was an error during the authentication");
  } else {
    //   localStorage.removeItem(stateKey);
    if (access_token) {
      $.ajax({
        url: "https://api.spotify.com/v1/me",
        headers: {
          Authorization: "Bearer " + access_token
        },
        success: function(response) {
          // userProfilePlaceholder.innerHTML = userProfileTemplate(response);
          $("#login").hide();
          $("#loggedin").show();
          // searchSpotify(access_token);
        }
      });
    } else {
      $("#login").show();
      $("#loggedin").hide();
    }
    document.getElementById("login-button").addEventListener(
      "click",
      function(e) {
        e.preventDefault();
        console.log("Login Clicked");
        var client_id = "2cdaa474a40145d9891e1690a0a81ac0"; // Your client id
        var redirect_uri = "http://127.0.0.1:5501/index.html"; // Your redirect uri
        var state = generateRandomString(16);
        localStorage.setItem(stateKey, state);
        var scope = "user-read-private user-read-email playlist-modify";
        var url = "https://accounts.spotify.com/authorize";
        url += "?response_type=token";
        url += "&client_id=" + encodeURIComponent(client_id);
        url += "&scope=" + encodeURIComponent(scope);
        url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
        url += "&state=" + encodeURIComponent(state);
        console.log(url);
        window.location = url;
      },
      false
    );
  }
})();

//////////////// BIT //////////////////////////////////////////////////////////////

let artist;
let spotifyArray = [];

// function to grab all the shows from an artist input via bandsintown API
function queryShows() {
  const queryUrl =
    "https://rest.bandsintown.com/artists/" +
    artist +
    "/events?app_id=db4cdbfd2bad1b7a3e4cdc51a42f15b9&date=upcoming";
  $.ajax({
    url: queryUrl,
    method: "GET"
  }).then(function(response) {
    console.log(response);
    //  var showsArray = response.offers.artist
    renderShows(response);
  });
}

// function to render show buttons to the DOM
const renderShows = function(responseArray) {
  const showContainer = $("<div>");
  responseArray.forEach(function(artistInfo) {
    console.log(artistInfo.lineup.toString());
    var str = artistInfo.datetime;
    var res = str.substring(0, 10);
    $("#shows").append(
      `<button class="show-button" data-artist="${artistInfo.lineup}"> City: ${
        artistInfo.venue.city
      } State: ${artistInfo.venue.region} Date: ${res} Full Lineup: ${
        artistInfo.lineup
      }</button>`
    );
  });
};
// click handler for grabbing info from search bar and making buttons
$("#add-artist").on("click", function(event) {
  event.preventDefault();
  artist = $("#artist-input")
    .val()
    .trim();
  queryShows();
  console.log("add shows button");
});

// click handler for picking a show to grab info from and send to spootifu API
$(document).on("click", ".show-button", function() {
  console.log("showbutton");
  spotifyArray = $(this)
    .attr("data-artist")
    .split(",");
  console.log(spotifyArray, spotifyArray.length);
  console.log($(this).attr("data-artist"));
  let lastPass;
  if (spotifyArray.length > 1) {
    for (let i = 0; i < spotifyArray.length; i++) {
      if (spotifyArray.length - 1 == i) {
        lastPass = true;
      } else {
        lastPass = false;
      }
      searchSpotify(
        access_token,
        spotifyArray[i],
        spotifyArray.length,
        lastPass
      );
      console.log(access_token);
    }
  } else {
    lastPass = true;
    searchSpotify(access_token, spotifyArray, spotifyArray.length, lastPass);
  }

  // make sure tracklist string is not empty before creating running function
  // console.log(trackListString);
  // if (trackListString){
  makeFinalPlaylist();
  // }
});
