'use strict';

const xappToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTU1MTc2MDYxOSwiaWF0IjoxNTUxMTU1ODE5LCJhdWQiOiI1Yzc0YzFiZjUwNjZlYTc5Mjc0NGE0MzYiLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNWM3NGMyNmJjYjc5MmIwZWUxNzY3YTEyIn0.VGmsPwvi3jUH_Ib0lDATChkgL8PQ9BomgHYAcd7lEBk';

const searchURL = 'https://api.artsy.net/api/';

const auth = {
  headers: new Headers({
    "X-XAPP-Token": xappToken})
};

// cached jQuery selectors
const $errorMessage = $('#js-error-message');
const $imageFrame = $('#js-image-frame');
const $artTitle = $('.art-title');
const $artDate = $('.art-date');
const $artMedium = $('.art-medium');
const $artInstitution = $('.art-institution');
const $artsyLink = $('.artsy-link');
const $infoButton = $('.info-button');
const $artMoreInfo = $('#artwork-more-info');
const $thumbsUp = $('.thumbs-up');
const $thumbsDown = $('.thumbs-down');
const $artist = $('.artist');

// when info button is clicked,
// remove hidden class and display
function showMoreInfo() {
  $infoButton.click(event => {
    $artMoreInfo.removeClass('hidden');
  });
}

// when thumbs-up button is clicked,
// retrieve similar image from the API and display
function getSimilarImage(artworkID) {
  $thumbsUp.click(event => {
    
    console.log('getSimilarImage ran');
      
    const similarParams = {similar_to_artwork_id: artworkID};
    console.log(similarParams);
    const queryString = formatQueryParams(similarParams);
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
        $errorMessage.text(`Something went wrong: ${err.message}`);
      });
  });
}
   
// display retrieved image and title
function displaySimilarImage(responseJson) {
  console.log(responseJson);

  const similarArtworks = responseJson._embedded.artworks;
  const sample = similarArtworks[Math.floor(Math.random()*similarArtworks.length)];
  
  let image = sample._links.image.href.split("{", 1);
  let large = sample.image_versions[0];
  
  // avoid "large_rectangle" size if no "large"
  if (large === "large_rectangle") {
    let large = sample.image_versions[1];
  } else {
    let large = sample.image_versions[0];
  }

  let largeImage = image + large + ".jpg";

  $imageFrame.html(
    `<img class="image-frame" src="${largeImage}" 
    alt="${sample.slug}">`);
  
  $artTitle.html(
    `${sample.title}`);

  if (sample.date === "") {
    $artDate.html("N/A")
  } else {
    $artDate.html(`${sample.date}`);
  }
  if (sample.medium === "") {
    $artMedium.html("N/A")
  } else {
    $artMedium.html(`${sample.medium}`);
  }
  if (sample.collecting_institution === "") {
    $artInstitution.html("N/A")
  } else {
    $artInstitution.html(`${sample.collecting_institution}`);
  }
  $artsyLink.attr("href", `${sample._links.permalink.href}`);
 
  const artworkID = sample.id;
  console.log(artworkID);
  getArtist(artworkID);
}

// when thumbs-down button is clicked,
// retrieve new random image from API and display
function getDifferentImage() {
  $thumbsDown.click(event => {
    getRandomImage();
  });
}

// get and display artist name
function getArtist(artworkID) {
  
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
      $errorMessage.text(`Something went wrong: ${err.message}`);
    });
}

function displayArtist(responseJson) {
  const artists = responseJson._embedded.artists;
  if (artists.length < 1) {
    $artist.html("Unknown");
  } else {
    $artist.html(`${artists[0].name}`);}
}

// display retrieved image and info
function displayImage(responseJson) {
  
  console.log(responseJson);
   
  let image = responseJson._links.image.href.split("{", 1);
  let large = responseJson.image_versions[0];
        
  if (large === "large_rectangle") {
    large = responseJson.image_versions[1];
  } else {
    large = responseJson.image_versions[0];
  }

  let largeImage = image + large + ".jpg";

 $imageFrame.html(
    `<img class="image-frame" src="${largeImage}" 
    alt="${responseJson.slug}">`);
    
  $artTitle.html(
    `${responseJson.title}`);
  
  if (responseJson.date === "") {
    $artDate.html('N/A')
  } else {
    $artDate.html(`${responseJson.date}`);
  }
  if (responseJson.medium === "") {
    $artMedium.html('N/A')
  } else {
    $artMedium.html(`${responseJson.medium}`);
  }
  if (responseJson.collecting_institution === "") {
    $artInstitution.html('N/A')
  } else {
    $artInstitution.html(`${responseJson.collecting_institution}`);
  }
  $artsyLink.attr("href", `${responseJson._links.permalink.href}`);
      
  const artworkID = responseJson.id;
  console.log(artworkID);

  getArtist(artworkID);
  getSimilarImage(artworkID);
  getDifferentImage();
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

  console.log("getRandomImage ran");
  
  const randomParams = {sample: 1};
  const queryString = formatQueryParams(randomParams);
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
      $errorMessage.text(`Something went wrong: ${err.message}`);
    });
}

getRandomImage();
