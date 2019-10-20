//API key for Hiking Project Data API
const hikingProjectKey = '200613378-0612b22d914728adefe17eb3fda22c5e';
const hikingProjectUrl = 'https://www.hikingproject.com/data/get-trails?';
const nearbycampgroundUrl = 'https://www.hikingproject.com/data/get-campgrounds?';

//API key for MapQuest API
const mapQuestKey = 'Nmlkds9MvGSvViGL4GDaWqFiuU0uSJQk';
const mapQuestUrl = 'https://open.mapquestapi.com/geocoding/v1/address?';

let displayLocationForResults = '';
//handle user event submit
function formSubmit(){
    $('form').submit(event => {
        event.preventDefault();
        const chosenLocation = $('#location').val();
        const chosenMaxDistance = $('#distanceFrom').val();
        const chosenLength = $('#trailLength').val();
        const chosenMinimumRating = $('#minimumRating').val();
        doThingsWithUserInputs(chosenLocation, chosenMaxDistance, chosenLength, chosenMinimumRating);
        displayLocationForResults = chosenLocation;
        return chosenLocation;
});}

//get and handle user inputs
function doThingsWithUserInputs(location, maxDistanceChosen, length, rating){
    
    //create object to store user inputs
    const userInputs = {
        maxDistance : maxDistanceChosen,
        minLength : length,
        minStars : rating
    };

    //create query to get user location input
    const locationUrl = mapQuestUrl + `key=${mapQuestKey}` + `&location=${location}`;
    

    //fetch lat/lon coordinates using query from location input
    fetch(locationUrl)
    .then(response => {
        if (response.ok){
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => useLocationResults(responseJson))
    .catch(err => {alert(`There was an error! Something went wrong: ${err.message}`)});


    //create lat/long part of query and add to userInputs object
    function useLocationResults(responseJson){
        userInputs.lat = responseJson.results[0].locations[0].latLng.lat;
        userInputs.lon = responseJson.results[0].locations[0].latLng.lng;

        createTrailsQuery(userInputs);

    }
    

    //create 2nd query for Hiking Project Data API using updated userInputs object
    function createTrailsQuery(params){
        const trailsQuery = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${params[key]}`);
        trailsParams = trailsQuery.join('&')
        trailsUrl = hikingProjectUrl + `key=${hikingProjectKey}` + `&${trailsParams}`;
        
        retrieveTrails(trailsUrl);        

    }
    //fetch trails using 2nd query
    function retrieveTrails(trailsUrl){
        //console.log(trailsUrl);
        fetch(trailsUrl)
        .then(response => {
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayTrailResults(responseJson))
        .catch(err => {alert(`There was an error! Something went wrong: ${err.message}`)});
    
    }

}

//create object to hold lat and lon for nearby campgrounds
let trailLocations = [];

//handle & display trail results to user
function displayTrailResults (responseJson){
    clearCurrent();
    $('#backgroundImg').hide();
    
    //move search up to top and hide
        $('form').addClass('hidden');
        $('form').css({'marginTop': '0', 'top': '0', 'left': '0', 'width': '100%', 'bottom': 'unset'})
        $(`<div id="resultsHeader"><p>Showing Search Results for "${displayLocationForResults}"</p><button type="submit" id="showForm">Update Search</button></div>`).insertBefore('ul')
        console.log(displayLocationForResults);
    
        
    //display trails
    for (let i = 0; i < responseJson.trails.length; i++){
        $('ul').append(
            `<li>
                ${imageMissing(i)}
                <a href="${responseJson.trails[i].url}" target="-blank">
                <h2 class="name">${responseJson.trails[i].name}</h2></a>
                <p>${responseJson.trails[i].summary}</p>
                <p class="location">${responseJson.trails[i].location}</p>
                <p class="location">${responseJson.trails[i].length} Miles</p>
                <p class="location">Rating: ${responseJson.trails[i].stars}/5</p>
                <p class="location">Current Condition: ${responseJson.trails[i].conditionStatus}</p>
                <a href="${responseJson.trails[i].url}" target="-blank">Visit website</a>
                <button type="submit" id="nearbyCampgrounds" class="findCampground${i}">Search for Nearby Campgrounds</button>
            </li>`
        )
        trailLocations.push({
            lat: responseJson.trails[i].latitude,
            lon: responseJson.trails[i].longitude
        });
    };

    //handle empty image string
    function imageMissing(i){
        
        const imageValue = responseJson.trails[i].imgMedium;
        if ( imageValue === ''){
            return `<div></div>`
        } else{
            return `<div>
            <img src="${responseJson.trails[i].imgMedium}" alt="${responseJson.trails[i].name}">
        </div>`
        }
    }

    const checkIfEmpty = $('ul');
    if(checkIfEmpty.is(':empty')){
        $('ul').append(`<li class="error">No trails were matched with your search. Please try different search parameters.</li>`)
    }


}
let trailClass = '';
//handle user submit nearby campground search
function campgroundSubmit(){
    $('ul').on('click', '#nearbyCampgrounds', function() {
        event.preventDefault();
        trailClass = $(this).attr('class');
        const trailNumber = trailClass[trailClass.length-1];
        retrieveLatestDataLocations(trailNumber);
        
        
        
});}
function retrieveLatestDataLocations(n){
    const trailLat = trailLocations[n].lat;
    const trailLon = trailLocations[n].lon;

    findNearbyCampgrounds(trailLat, trailLon);
}

//get nearby campgrounds
function findNearbyCampgrounds(lat, lon){
    
    const campgroundUrl = nearbycampgroundUrl + `lat=${lat}` + `&lon=${lon}` + `&key=${hikingProjectKey}` + `&maxDistance=60`;
    //console.log(campgroundUrl);
    fetch(campgroundUrl)
        .then(response => {
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayCampgroundResults(responseJson))
        .catch(err => {alert(`There was an error! Something went wrong: ${err.message}`)});
    }

//display campground results
function displayCampgroundResults(responseJson){
    
    if(responseJson.campgrounds.length === 0){
        $(`<p>Sorry, no campgrounds were found nearby.</p>`).insertAfter(`.${trailClass}`)
    } else{
        for (let i = 0; i < responseJson.campgrounds.length && i < 3; i++){
            $(`<div class="campgrounds">
            <img src="${responseJson.campgrounds[i].imgUrl}">
            <a href="${responseJson.campgrounds[i].url}"><h3 class="name">${responseJson.campgrounds[i].name}</h3></a>
        </div>`).insertAfter(`.${trailClass}`
    
        )
        
    };}
}

//Show search form on user click of Update Search button
function showSearchForm(){
    $('main').on('click', '#showForm', function() {
        event.preventDefault();
        $('#resultsHeader').remove();
        $('form').removeClass('hidden');
    });
}

//clear results if new search submitted
//also clear object storing locations
function clearCurrent(){
    $('ul').empty();
    trailLocations = [];
}

$(formSubmit);
$(campgroundSubmit);
$(showSearchForm);