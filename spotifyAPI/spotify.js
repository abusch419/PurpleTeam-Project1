function searchSpotify(token) {

  // Grab text the user typed into the search input, add to the queryParams object
  queryParams = $("#search-term")
    .val()
    .trim();
  console.log(queryParams);
  
  $.ajax({
    url:
      "https://api.spotify.com/v1/search?q=" +
      "santana" +
      "&" +
      "type=artist",    
    method: "GET",
    headers: {
      Authorization: "Bearer " + token
    }
  }).then(function(response, err) {
    console.log(response);
    console.log(response.artists.items[0].id);
    $.ajax({
      url:
        "https://api.spotify.com/v1/artists/" +
        response.artists.items[0].id +
        "/top-tracks?country=us",      
      method: "GET",
      headers: {
        Authorization: "Bearer " + token
      }
    }).then(function(res, err) {
      console.log(res);
      let tracklist = [];
      let tracklistString = "uris=";
      for (let i=0; i<res.tracks.length; i++) {
        tracklist.push(res.tracks[i].id);
        if (i === res.tracks.length -1){
        tracklistString += `spotify:track:${res.tracks[i].id}`
        }else {
          tracklistString += `spotify:track:${res.tracks[i].id},`
        }
      }
      console.log("tracklist var: ", tracklist);
      console.log(tracklistString);
      // $("#musicDiv").append(`<iframe src="https://open.spotify.com/embed/track/${res.tracks[0].id}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`);
      $.ajax({
        url:
          "https://api.spotify.com/v1/me",      
        method: "GET",
        headers: {
          Authorization: "Bearer " + token
        }
      }).then(function(res, err) {
        console.log(res.id);
        $.ajax({
          url:
            "https://api.spotify.com/v1/users/" + res.id + "/playlists",      
          method: "POST",
          headers: {
            Authorization: "Bearer " + token
          },
          data: JSON.stringify({
            name: "Mic Check Playlist",
            
          })
          
        }).then(function(res, err) {
          console.log("create playlist:",  res.id);
          let playlistID = res.id;
          $.ajax({
            url:
              "https://api.spotify.com/v1/playlists/" + res.id + "/tracks?" + tracklistString,      
            method: "POST",
            headers: {
              Authorization: "Bearer " + token
            },
            data: JSON.stringify({
              name: "Mic Check Playlist",
              
            })
            
          }).then(function(res, err) {
            console.log("populating playlist:",  res);
            $("#musicDiv").append(`<iframe src="https://open.spotify.com/embed/playlist/${playlistID}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`);
            // <iframe src="https://open.spotify.com/embed/album/1DFixLWuPkv3KT3TnV35m3" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            
    
          });
          
  
        });

      });
      
    });
  });
}

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
  var access_token = params.access_token,
    state = params.state,
    storedState = localStorage.getItem(stateKey);
  if (access_token && (state == null || state !== storedState)) {
    alert("There was an error during the authentication");
  } else {
    // localStorage.removeItem(stateKey);
    if (access_token) {
      $.ajax({
        url: "https://api.spotify.com/v1/me",
        headers: {
          Authorization: "Bearer " + access_token
        },
        success: function(response) {
          userProfilePlaceholder.innerHTML = userProfileTemplate(response);
          $("#login").hide();
          $("#loggedin").show();
          searchSpotify(access_token);
        }
      });
    } else {
      $("#login").show();
      $("#loggedin").hide();
    }
    document.getElementById("login-button").addEventListener(
      "click",
      function() {
        var client_id = "2cdaa474a40145d9891e1690a0a81ac0"; // Your client id
        var redirect_uri = "http://127.0.0.1:5500/spotifyAPI/index.html"; // Your redirect uri
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
  }
})();
