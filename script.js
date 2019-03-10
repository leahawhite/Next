'use strict';

const xappToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTU1MjM2NzIyOSwiaWF0IjoxNTUxNzYyNDI5LCJhdWQiOiI1Yzc0YzFiZjUwNjZlYTc5Mjc0NGE0MzYiLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNWM3ZTAzZmQ3NzVjMWIyMjJlZDUwZjQ1In0.LvlfOuvfoSZv64cHBHxZ62R0BRcEYup0EOAxP-6w_rU';

const baseURL = 'https://api.artsy.net/api/';

const auth = {
  headers: new Headers({
    'X-XAPP-Token': xappToken,
  }),
};

// cached jQuery selectors
const $errorMessage = $('#js-error-message');
const $imageFrame = $('#js-image-frame');
const $artTitle = $('.art_value-title');
const $artDate = $('.art_value-date');
const $artMedium = $('.art_value-medium');
const $artInstitution = $('.art_value-institution');
const $artsyLink = $('.artsy-link');
const $rightNav = $('.right-nav');
const $leftNav = $('.left-nav');
const $artist = $('.art_value-artist');
const $spinner = $('.spinner');
const $main = $('main');

let isFetching = false;

function setSpinner() {
  if (isFetching) {
    $spinner.css({ display: 'block' });
    $main.css({ display: 'none' });
  } else {
    $spinner.css({ display: 'none' });
    $main.css({ display: 'block' });
  }
}

// when right-arrow button is clicked,
// retrieve similar image from the API
function getSimilarImage() {
  $rightNav.click(event => {
    console.log('GetSimilarImage ran');
    $errorMessage.empty();
    let artworkID = $('#artworkID').val();

    const similarParams = { similar_to_artwork_id: artworkID };
    const queryString = formatQueryParams(similarParams);
    const url = baseURL + 'artworks' + '?' + queryString;
    console.log(url);

    isFetching = true;
    setSpinner();

    fetch(url, auth)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => {
        isFetching = false;
        setSpinner();
        displaySimilarImage(responseJson);
      })
      .catch(err => {
        $errorMessage.text(`Something went wrong: ${err.message}`);
      });
  });
}

// display retrieved image and title
function displaySimilarImage(responseJson) {
  console.log(responseJson);

  const similarArtworks = responseJson._embedded.artworks;
  const sample = similarArtworks[Math.floor(Math.random() * similarArtworks.length)];

  // if there is no image available,
  // get new random image and display
  if ( !similarArtworks.length || !("image" in sample._links)) {
    getRandomImage();
  } else {

    let image = sample._links.image.href.split('{', 1);
    let large;

    // avoid cropped image versions
    if (sample.image_versions[0] !== 'large'
        && sample.image_versions[0] !== 'larger') {
      large = sample.image_versions[1];
    } else {
      large = sample.image_versions[0];
    }

    let largeImage = image + large + '.jpg';

    $imageFrame.html(
      `<img class="image-frame" src="${largeImage}" 
      alt="${sample.slug}">`
    );

    $artTitle.html(`${sample.title}`);

    if (sample.date === '') {
      $artDate.html('N/A');
    } else {
      $artDate.html(`${sample.date}`);
    }
    if (sample.medium === '') {
      $artMedium.html('N/A');
    } else {
      $artMedium.html(`${sample.medium}`);
    }
    if (sample.collecting_institution === '') {
      $artInstitution.html('N/A');
    } else {
      $artInstitution.html(`${sample.collecting_institution}`);
    }
    $artsyLink.attr('href', `${sample._links.permalink.href}`);

    const permalink = sample._links.permalink.href;
    const title = sample.title;
    shareArtwork(permalink, title);
    
    const artworkID = sample.id;
    $('#artworkID').val(artworkID);
    console.log(artworkID);
    getArtist(artworkID);
  
  }
}

// when left-nav button is clicked,
// retrieve new random image from API and display
function getDifferentImage() {
  $leftNav.click(event => {
    getRandomImage();
  });
}

// get and display artist name
function getArtist(artworkID) {
  const artistParams = { artwork_id: artworkID };
  const queryString = formatQueryParams(artistParams);
  const url = baseURL + 'artists' + '?' + queryString;
  console.log(url);

  isFetching = true;
  setSpinner();

  fetch(url, auth)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      displayArtist(responseJson);
      isFetching = false;
      setSpinner();
    })
    .catch(err => {
      $errorMessage.text(`Something went wrong: ${err.message}`);
    });
}

function displayArtist(responseJson) {
  const artists = responseJson._embedded.artists;
  if (artists.length < 1) {
    $artist.html('Unknown');
  } else {
    $artist.html(`${artists[0].name}`);
  }
}

// display retrieved image and info
function displayImage(responseJson) {
  console.log(responseJson);

  // if there is no image available,
  // get new random image and display
  if (!("image" in responseJson._links)) {
    getRandomImage();
  } else {

    let image = responseJson._links.image.href.split('{', 1);
    let large;

    // avoid cropped images
    if (responseJson.image_versions[0] !== 'large'
        && responseJson.image_versions[0] !== 'larger') {
      large = responseJson.image_versions[1];
    } else {
      large = responseJson.image_versions[0];
    }

    let largeImage = image + large + '.jpg';

    $imageFrame.html(
      `<img class="image-frame" src="${largeImage}" 
      alt="${responseJson.slug}">`
    );

    $artTitle.html(`${responseJson.title}`);

    if (responseJson.date === '') {
      $artDate.html('N/A');
    } else {
      $artDate.html(`${responseJson.date}`);
    }
    if (responseJson.medium === '') {
      $artMedium.html('N/A');
    } else {
      $artMedium.html(`${responseJson.medium}`);
    }
    if (responseJson.collecting_institution === '') {
      $artInstitution.html('N/A');
    } else {
      $artInstitution.html(`${responseJson.collecting_institution}`);
    }
    $artsyLink.attr('href', `${responseJson._links.permalink.href}`);

    const permalink = responseJson._links.permalink.href;
    const title = responseJson.title;
    shareArtwork(permalink, title);

    const artworkID = responseJson.id;
    $('#artworkID').val(artworkID);
    console.log(artworkID);
    getArtist(artworkID);
  }
}

function shareArtwork(permalink, title) {
  $('.share-facebook').attr('href', `https://www.facebook.com/sharer.php?u=${permalink}`);
  $('.share-twitter').attr('href', `http://twitter.com/intent/tweet?text=${permalink}`);
  const subject = `${title}`; 
  console.log(subject); 
  const subjectEncoded = encodeURIComponent(subject);
  $('.share-email').attr('href', `mailto:?subject=${subjectEncoded}&body=${permalink}`);
} 

// format parameter values for query string
function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join('&');
}

// when page initially loads, format header with key,
// format params for random search,
// contact API for one image and display it
function getRandomImage() {
  console.log('GetRandomImage ran');
  $errorMessage.empty();

  const randomParams = { sample: 1 };
  const queryString = formatQueryParams(randomParams);
  const url = baseURL + 'artworks' + '?' + queryString;

  isFetching = true;
  setSpinner();

  fetch(url, auth)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      isFetching = false;
      setSpinner();
      displayImage(responseJson);
    })
    .catch(err => {
      $errorMessage.text(`Something went wrong: ${err.message}`);
    });
}

const imageFrame = document.getElementById('js-image-frame');

$(function() {
  getRandomImage();
  getSimilarImage();
  getDifferentImage();
});
