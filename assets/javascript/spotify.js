hideloader();
hideMusicLoader();

// global variables
let trackListString = "";
let playlistId;
let access_token;
let tracklist = [];
let artistId;

// main spotify search function called when user clicks show button generated from BIT
function searchSpotify(token, searchParams, arrayLength, lastPass) {
  // spotify api search artist get request, response is an object and we grab the id in order to continue
  return searchArtist(searchParams, token).then(function(response, err) {
    if (response.artists.items.length > 0) {
      artistId = response.artists.items[0].id;
      // calls getTopTracks function which generates an array of top tracks for artist
      return getTopTracks(artistId, token).then(function(res, err) {
        // for loop that iterates through the spotify top tracks array and pushes tracks into our tracklist var
        for (let i = 0; i < res.tracks.length; i++) {
          tracklist.push(`spotify:track:${res.tracks[i].id}`);
        }
      });
    }
  });
}

// this function is called once we have a finalized tracklist
function makeFinalPlaylist() {
  showloader();
  token = access_token;
  getUser(token)
    .then(function(res, err) {
      const userId = res.id;

      // This function creates a new playlist called SoundCheck Playlist for spotify user logged in
      return createPlaylist(userId, token);
    })
    .then(function(res, err) {
      playlistId = res.id;
      // This funtion loads out tracklist into the newly generated playlist
      return updatePlaylist(res.id, trackListString, token);
    })
    .then(function() {
      // This function renders the playlist to the DOM
      renderPlaylist(playlistId);
    });
  hideloader();
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
      name: `${spotifyArray[0]} Playlist By SoundCheck`
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
    }
  });
}

// render playlist to DOM
function renderPlaylist(playlistId) {
  $("#music-div").prepend(
    `<iframe id="spotifyPlaylist" src="https://open.spotify.com/embed/playlist/${playlistId}" width="300" height="600" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`
  );
  hideMusicLoader();
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
          $("#artist-input").show();
          $("#add-artist").show();
          $("#sign-in").hide();
          $("#clear").show();
          hideloader();
          hideMusicLoader();
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

        var client_id = "2cdaa474a40145d9891e1690a0a81ac0"; // Your client id
        var redirect_uri = "http://127.0.0.1:5501/index.html"; //"http://127.0.0.1:5501/index.html"; // Your redirect uri
        var state = generateRandomString(16);
        localStorage.setItem(stateKey, state);
        var scope = "user-read-private user-read-email playlist-modify";
        var url = "https://accounts.spotify.com/authorize";
        url += "?response_type=token";
        url += "&client_id=" + encodeURIComponent(client_id);
        url += "&scope=" + encodeURIComponent(scope);
        url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
        url += "&state=" + encodeURIComponent(state);

        window.location = url;
      },
      false
    );
    // hiding from DOM until user is logged in to spotify
    $("#user-profile").hide();
    $("#artist-input").hide();
    $("#add-artist").hide();
    $("#clear").hide();
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
    //  var showsArray = response.offers.artist
    renderShows(response);
  });
}

// function to render show buttons to the DOM
const renderShows = function(responseArray) {
  const showContainer = $("<div>");
  responseArray.forEach(function(artistInfo) {
    var str = artistInfo.datetime;
    var res = str.substring(0, 10);
    $("#shows").prepend(

      `<button class="btn-default btn-secondary show-button btn-outline-secondary btn-block btn" data-artist="${

      `<button class="btn-default btn-secondary show-button btn-outline-secondary btn-block btn" data-artist="${

        artistInfo.lineup
      }"> <b>Date:</b> ${res}  <b>City:</b> ${
        artistInfo.venue.city
      }  <b>State:</b> ${artistInfo.venue.region}  <b>Lineup:</b> ${
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
});

// click handler for picking a show to grab info from and send to spootifu API
$(document).on("click", ".show-button", function() {
  giveMusicLoaderClass();
  showMusicLoader();

  spotifyArray = $(this)
    .attr("data-artist")
    .split(",");

  let lastPass;
  const artistRequests = [];
  for (let i = 0; i < spotifyArray.length; i++) {
    if (spotifyArray.length - 1 == i) {
      lastPass = true;
    } else {
      lastPass = false;
    }
    const artistReq = searchSpotify(
      access_token,
      spotifyArray[i],
      spotifyArray.length,
      lastPass
    );
    artistRequests.push(artistReq);
  }

  Promise.all(artistRequests).then(function() {
    trackListString = buildTrackListString(tracklist);
    makeFinalPlaylist();
  });
});

function buildTrackListString(trackListArr) {
  trackListArr = shuffle(trackListArr);
  if (trackListArr.length > 99) {
    trackListArr.splice(99);
  }
  return trackListArr.join(",");
}

//////////////// Clear Function //////////////////////////////////////////////////////////////

$("#clear").on("click", function(e) {
  e.preventDefault();
  $("#shows").empty();
  $("#music-div").html('<div id="musicLoader"></div>');
   
});

// loader

function hideloader() {
  document.getElementById("loading").style.display = "none";
}

function showloader() {
  document.getElementById("loading").style.display = "inherit";
}

function giveMusicLoaderClass() {
  document.getElementById("musicLoader").className = "musicLoader";
}

function hideMusicLoader() {
  document.getElementById("musicLoader").style.display = "none";
}

function showMusicLoader() {
  document.getElementById("musicLoader").style.display = "inherit";
}
