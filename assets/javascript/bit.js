let artist;
// let artistArray = [];

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
    // console.log(artistInfo.lineup)
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
// click handler for grabbing info from the show buttons to give to spotify
$("#add-artist").on("click", function(event) {
  event.preventDefault();
  artist = $("#artist-input")
    .val()
    .trim();
  queryShows();
  console.log("add shows button");
});

let spotifyArray = [];

// click handler for picking a show to grab info from and send to spootifu API
$(document).on("click", ".show-button", function() {
  console.log("showbutton");

  spotifyArray = $(this).attr("data-artist");

  console.log(spotifyArray);
});
