'use strict';

const xappToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTU1OTI0OTY0NiwiaWF0IjoxNTU4NjQ0ODQ2LCJhdWQiOiI1Y2RjZTQ0YzU2ZjMyZDM3ZmNiYjQwYTciLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNWNlNzA4NmU1YWJjNmMwMDBkNzVlZGYxIn0.r2GJwZqv705HTD5Tn7svffuyWqiM7-lhIiGu-zpzUvY';
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

function setSpinner(isFetching) {
  if (isFetching) {
    $spinner.css({ display: 'block' });
    $main.css({ display: 'none' });
  } else {
    $spinner.css({ display: 'none' });
    $main.css({ display: 'block' });
  }
}

// on left-nav click, get new random image
function watchLeftNav() {
  $leftNav.click(event => {
    // delete any lingering error message 
    $errorMessage.empty();
    fetchData({ sample: 1 }, 'artworks', displayImage);
  });
}

// on right-nav click, get related image
function watchRightNav() {
  $rightNav.click(event => {
    let artworkID = $('#artworkID').val();
    $errorMessage.empty();
    fetchData({ similar_to_artwork_id: $('#artworkID').val() }, 'artworks', displaySimilarImage);
  });
}

// display retrieved image and title
function displaySimilarImage(data) {
  const similarArtworks = data._embedded.artworks;
  const sample = similarArtworks[Math.floor(Math.random() * similarArtworks.length)];

  // if no image available, get new random image
  if (!similarArtworks.length || !("image" in sample._links)) {
    fetchData({ sample: 1 }, 'artworks', displayImage);
  } else {
    let image = sample._links.image.href.split('{', 1);
    let imageVersions = sample.image_versions;
    let largeImage;
    // avoid cropped image versions
    if (imageVersions.includes('large') === true) {
      largeImage = image + 'large' + '.jpg';
    } else if (imageVersions.includes('larger') === true) {
      largeImage = image + 'larger' + '.jpg';
    } else if (imageVersions.includes('medium') === true) {
      largeImage = image + 'medium' + '.jpg';
    } else if (imageVersions.includes('normalized') === true) {
      largeImage = image + 'normalized' + '.jpg';
    } else {
      let size = sample.image_versions[0];
      largeImage = image + size + '.jpg';
    }
    $imageFrame.html(
      `<img class="image-frame" src="${largeImage}" 
      alt="${sample.slug}">`
    );

    // display artwork info
    $artTitle.html(`${sample.title}`);
    if (!sample.date) {
      $artDate.html('N/A');
    } else {
      $artDate.html(`${sample.date}`);
    }
    if (!sample.medium) {
      $artMedium.html('N/A');
    } else {
      $artMedium.html(`${sample.medium}`);
    }
    if (!sample.collecting_institution) {
      $artInstitution.html('N/A');
    } else {
      $artInstitution.html(`${sample.collecting_institution}`);
    }
    $artsyLink.attr('href', `${sample._links.permalink.href}`);

    // info for social media links
    const permalink = sample._links.permalink.href;
    const title = sample.title;
    shareArtwork(permalink, title);

    // get artist name  
    const artworkID = sample.id;
    $('#artworkID').val(artworkID);
    fetchData({ artwork_id: artworkID }, 'artists', displayArtist);
  }
}

// social media links
function shareArtwork(permalink, title) {
  $('.share-facebook').attr('href', `https://www.facebook.com/sharer.php?u=${permalink}`);
  $('.share-twitter').attr('href', `http://twitter.com/intent/tweet?text=${permalink}`);
  const subject = `${title}`;
  const subjectEncoded = encodeURIComponent(subject);
  $('.share-email').attr('href', `mailto:?subject=${subjectEncoded}&body=${permalink}`);
}

let timeoutId;

// get data from Artsy API
function fetchData(params, endpoint, cb) {
  setSpinner(true);

  timeoutId = setTimeout(() => {
    /**
     * If the API fails to deliver data within 5 seconds
     * send a new request for data as most probably
     * API will fail after 15 seconds, which is far too long
     * for not showing anything to the user
     */
    fetchData(params, endpoint, cb);
  }, 5000);

  fetch(normalizeUrl(endpoint, params), auth)
    .then(response => {
      if (response.ok) {
        clearTimeout(timeoutId);
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then(response => {
      console.log('resolved');
      cb(response);
      setSpinner(false);
    })
    .catch(err => {
      setSpinner(false);
      clearTimeout(timeoutId);
      console.log(err);
      $errorMessage.html(
        `Sorry, we encountered a problem loading the data.<br>Click the left or right arrow for a new image.`);
    });
}

// display retrieved image and info
function displayImage(data) {

  // if no image available, get new random image
  if (!("image" in data._links)) {
    fetchData({ sample: 1 }, 'artworks', displayImage);
  } else {
    let image = data._links.image.href.split('{', 1);
    let large;

    // avoid cropped image versions
    if (data.image_versions[0] !== 'large' && data.image_versions[0] !== 'larger') {
      large = data.image_versions[1];
    } else {
      large = data.image_versions[0];
    }

    let largeImage = image + large + '.jpg';

    $imageFrame.html(
      `<img class="image-frame" src="${largeImage}" 
      alt="${data.slug}">`
    );

    // display artwork info
    $artTitle.html(`${data.title}`);

    if (!data.date) {
      $artDate.html('N/A');
    } else {
      $artDate.html(`${data.date}`);
    }
    if (!data.medium) {
      $artMedium.html('N/A');
    } else {
      $artMedium.html(`${data.medium}`);
    }
    if (!data.collecting_institution) {
      $artInstitution.html('N/A');
    } else {
      $artInstitution.html(`${data.collecting_institution}`);
    }
    $artsyLink.attr('href', `${data._links.permalink.href}`);

    // info for social media
    const permalink = data._links.permalink.href;
    const title = data.title;
    shareArtwork(permalink, title);

    // get artist name
    const artworkID = data.id;
    $('#artworkID').val(artworkID);
    fetchData({ artwork_id: artworkID }, 'artists', displayArtist);
  }
}

function displayArtist(data) {
  const artists = data._embedded.artists;
  if (artists.length < 1) {
    $artist.html('Unknown');
  } else {
    $artist.html(`${artists[0].name}`);
  }
}

// format fetch URL with endpoint and parameters
function normalizeUrl(endpoint, params) {
  const queryItems = Object.keys(params).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return `${baseURL}${endpoint}?${queryItems.join('&')}`;
}

$(function () {
  fetchData({ sample: 1 }, 'artworks', displayImage);
  watchRightNav();
  watchLeftNav();
});
