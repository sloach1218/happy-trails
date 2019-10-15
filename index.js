//API key for Hiking Project Data API
const hikingProjectKey = '200613378-0612b22d914728adefe17eb3fda22c5e';
const hikingProjectUrl = 'https://www.hikingproject.com/data/get-trails?';

//API key for MapQuest API
const mapQuestKey = 'Nmlkds9MvGSvViGL4GDaWqFiuU0uSJQk';
const mapQuestUrl = 'http://open.mapquestapi.com/geocoding/v1/address?';


//handle user event submit
function formSubmit(){
    $('form').submit(event => {
        event.preventDefault();
        const chosenLocation = $('#location').val();
        const chosenMaxDistance = $('#distanceFrom').val();
        const chosenLength = $('#trailLength').val();
        const chosenMinimumRating = $('#minimumRating').val();
        doThingsWithUserInputs(chosenLocation, chosenMaxDistance, chosenLength, chosenMinimumRating);
        
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
        console.log(trailsUrl);
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

//handle & display trail results to user
function displayTrailResults (responseJson){
    clearCurrent();
    
    //move search up to fixed position to make room for results
    const formPosition = $("form").css("position");
    if(formPosition === 'absolute'){
        $("form").css({"textAlign": "left", "position": "fixed", "width": "100%", "backgroundColor": "white", "transform":"none", "top":"0", "left":"0"})
        $("form").addClass("fixedHeader");
        }
        
    //display trails
    for (let i = 0; i < responseJson.trails.length; i++){
        $('ul').append(
            `<li>
                ${imageMissing(i)}
                <a href="${responseJson.trails[i].url}" target="-blank">
                <h2>${responseJson.trails[i].name}</h2></a>
                <p>${responseJson.trails[i].summary}</p>
                <p class="location">${responseJson.trails[i].location}</p>
                <p class="location">${responseJson.trails[i].length} Miles</p>
                <p class="location">Rating: ${responseJson.trails[i].stars}/5</p>
                <a href="${responseJson.trails[i].url}" target="-blank">Visit website</a>
            </li>`
        )
    };

    //handle empty image string
    function imageMissing(i){
        
        const imageValue = responseJson.trails[i].imgMedium;
        if ( imageValue === ""){
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

//clear results if new search submitted
function clearCurrent(){
    $('ul').empty();
}

$(formSubmit);