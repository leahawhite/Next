'use strict';

const xappToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTU1MTc2MDYxOSwiaWF0IjoxNTUxMTU1ODE5LCJhdWQiOiI1Yzc0YzFiZjUwNjZlYTc5Mjc0NGE0MzYiLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNWM3NGMyNmJjYjc5MmIwZWUxNzY3YTEyIn0.VGmsPwvi3jUH_Ib0lDATChkgL8PQ9BomgHYAcd7lEBk';

const searchURL = 'https://api.artsy.net/api/';

// when info button is clicked,
// remove hidden class and display
function showMoreInfo() {
  $('.info-button').click(event => {
    $('#artwork-more-info').removeClass('hidden');
  });
}

// when thumbs-up button is clicked,
// retrieve similar image from the API and display
function getSimilarImage(artworkID) {
  $('.button-thumbs-up').click(event => {
    const auth = {
      headers: new Headers({
        "X-XAPP-Token": xappToken})
    };
  
    const similarParams = {similar_to_artwork_id: artworkID};
    console.log(similarParams);
    const queryString = formatQueryParams(similarParams)
    const url = searchURL + 'artworks' + '?' + queryString;
  
    console.log(url);
  
    fetch(url, auth)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => displaySimilarImage(responseJson))
      .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
      });
      
  });
}

// display retrieved image and title
function displaySimilarImage(responseJson) {
  console.log(responseJson);

  let image = responseJson._embedded.artworks[0]._links.image.href.split("{", 1);
  let large = responseJson._embedded.artworks[0].image_versions[0];
  let largeImage = image + large + ".jpg";

  $('#js-image-frame').html(
    `<img src="${largeImage}" 
    alt="${responseJson._embedded.artworks[0].slug}">`);
  
  $('.art-title').html(
    `"${responseJson._embedded.artworks[0].title}"`);

  const artworkID = responseJson._embedded.artworks[0].id;
  console.log(artworkID);
  getArtist(artworkID);
  getSimilarImage(artworkID);
  getDifferentImage();
}

// when thumbs-down button is clicked,
// retrieve new random image from API and display
function getDifferentImage() {
  $('.button-thumbs-down').click(event => {
    getRandomImage();
  });
}

// display retrieved image and info
function displayImage(responseJson) {
  console.log(responseJson);
  let image = responseJson._links.image.href.split("{", 1);
  let large = responseJson.image_versions[0];
  let largeImage = image + large + ".jpg";
  
  $('#js-image-frame').html(
    `<img src="${largeImage}" 
    alt="${responseJson.slug}">`);

  $('.art-title').html(
    `"${responseJson.title}"`);
  $('.art-date').html(
      `"${responseJson.date}"`);
  $('.art-category').html(
    `"${responseJson.category}"`);
  $('.art-medium').html(
    `"${responseJson.medium}"`);
  $('.art-institution').html(
    `"${responseJson.collecting_institution}"`);
  $('.artsy-link').attr("href", `"${responseJson._links.permalink}"`);
    
  const artworkID = responseJson.id;
  console.log(artworkID);
  getArtist(artworkID);
  getSimilarImage(artworkID);
  getDifferentImage();
}

// get and display artist name
function getArtist(artworkID) {
  const auth = {
    headers: new Headers({
      "X-XAPP-Token": xappToken})
  };

  const artistParams = {artwork_id: artworkID};
  console.log(artistParams);
  const queryString = formatQueryParams(artistParams)
  const url = searchURL + 'artists' + '?' + queryString;

  console.log(url);

  fetch(url, auth)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayArtist(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayArtist(responseJson) {
  $('.artist').html(
    `"${responseJson._embedded.artists[0].name}"`);
}


// format parameter values for query string
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

// when page initially loads, format header with key,
// format params for random search,
// contact API for one image and display it
function getRandomImage() {
  const auth = {
    headers: new Headers({
      "X-XAPP-Token": xappToken})
  };

  const randomParams = {sample: 1};
  const queryString = formatQueryParams(randomParams)
  const url = searchURL + 'artworks' + '?' + queryString;

  console.log(url);

  fetch(url, auth)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayImage(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

/*function getMonaLisa() {
  const auth = {
    headers: new Headers({
      "X-XAPP-Token": xappToken})
  };
  
  const monaLisa = "4d8b937c4eb68a1b2c001722";

  const url = searchURL + 'artworks/' + monaLisa;

  fetch(url, auth)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayImage(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}*/

/*function getRandomImage() {
  const auth = {
    headers: new Headers({
      "X-XAPP-Token": xappToken})
  };
  const iconID = [
    "4d8b937c4eb68a1b2c001722",
    "4d8b93b04eb68a1b2c001b9d",
    "4d8b93394eb68a1b2c0010fa",
    "4d8b92eb4eb68a1b2c000968",
    "516df0a9b31e2bd65e000975",
    "515b94f41b12b0e668001049",
    "516df191b31e2bd65e0009e1",
    "4d8b92ee4eb68a1b2c0009ab",
    "516ca4880f8b78ba650007ff",
    "504a04466333be0002000019",
    "59bd5a537622dd4d6e19f8ac"
  ];

  const randomImage = iconID[Math.floor(Math.random()*iconID.length)];
  console.log(randomImage);

  const url = searchURL + 'artworks/' + randomImage;

  fetch(url, auth)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayImage(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}*/

$(getRandomImage);

// populate image frame with image
// and show animated sample of swiping?
// function showInstructions() {

// }

// $(showInstructions);
