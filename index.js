//API key for Hiking Project Data API
const hikingProjectKey = '200613378-0612b22d914728adefe17eb3fda22c5e';
const hikingProjectUrl = 'https://www.hikingproject.com/data/get-trails?';
const mapQuestKey = 'Nmlkds9MvGSvViGL4GDaWqFiuU0uSJQk';
const mapQuestUrl = 'http://open.mapquestapi.com/geocoding/v1/address?';

//handle user event submit
function formSubmit(){
    $('form').submit(event => {
        event.preventDefault();
        const chosenLocation = $('#location').val();
        userLocationInput(chosenLocation);
        
});}
//get user location input and fetch lat long coordinates
function userLocationInput(location){
    
    const locationUrl = mapQuestUrl + `key=${mapQuestKey}` + `&location=${location}`;
    //fetch info
    fetch(locationUrl)
    .then(response => {
        if (response.ok){
            return response.json();
        }
        throw new Error(response.statusText);
    })
    
    .then(responseJson => useResults(responseJson))
    
    .catch(err => {alert(`There was an error! Something went wrong: ${err.message}`)});
}

//create 
function useResults(responseJson){
    const userLat = responseJson.results[0].locations[0].latLng.lat;
    const userLng = responseJson.results[0].locations[0].latLng.lng;

    const coordinatesJoined = `lat=${userLat}&lon=${userLng}`;
    console.log(coordinatesJoined); //delete this line later
    return coordinatesJoined;

}
//create 2nd query for Hiking Project Data API using location coordinates & user inputs

//fetch trails using 2nd query

//handle & display trail results to user

//clear results if new search submitted
function clearCurrent(){
    $('ul').empty();
}

$(formSubmit);