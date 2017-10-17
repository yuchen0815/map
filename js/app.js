
/*
This is "Neighborhood Map" project as part of Udacity Front-End Nanodegreee Program
This app depicts top 5 Maui Beaches via Google Map and List View (binded with Knockout).
Some data for locations was taken from Foursquare API

*/

/*jshint loopfunc: true */

// array of locations, 5 beaches in Maui, with names and coordiantes
var locations = [{
        name: 'Kapalua Bay',
        coordinates: {
            lat: 20.9999,
            lng: -156.6679
        }
    },
    {
        name: 'Kaanapali Beach',
        coordinates: {
            lat: 20.9240,
            lng: -156.6936
        }
    },
    {
        name: 'Makena Beach',
        coordinates: {
            lat: 20.624042,
            lng: -156.428622
        }
    },
    {
        name: 'Baldwin Beach Park',
        coordinates: {
            lat: 20.9131,
            lng: -156.3926
        }
    },
    {
        name: 'Olowalu Beach',
        coordinates: {
            lat: 20.8091,
            lng: -156.6156
        }
    },
    {
        name: 'Charley Young Beach',
        coordinates: {
            lat: 20.7246,
            lng: -156.4491
        }
    },
    {
        name: 'Wailea Beach',
        coordinates: {
            lat: 20.6828,
            lng: -156.4430
        }
    },
    {
        name: 'Keawakapu Beach',
        coordinates: {
            lat: 20.7040,
            lng: -156.4463
        }
    },
    {
        name: 'Honolua Bay',
        coordinates: {
            lat: 21.0139,
            lng: -156.6384
        }
    }
];


// array with data and attributes required for API request to Foursquare API
var foursquareLoginData = {
        url: 'https://api.foursquare.com/v2/venues/search', // foursquare api url
        dataType: 'json', // dataType, in this case it is json
        clientID: 'SXQCX00LSUAL5PKGIGFN4ROPNRN33KS5VLG2ZTN25OWQAEG4', // foursquare clientID
        clientSecret: 'B2FMPJT0E51P00JYHVXI20LVDAULFEDWHKO5E3CLMMAPR4EC', // foursquare clientSecret
        searchNear: 'Maui', // specifying area where to look for
        requestDate: 20170620, // version as a date
        venueLink: "https://foursquare.com/v/" // link of place on foursquare
};

/*
 * Initializing global variables
 */
// global map variable
var map;

// Map marker variable
var marker;

// InfoWindow element to show data when clicked on marker
var infoWindow;

// array to store map markeres
var markers = [];

/*
 * initMap() function that does initial site loading
 */
function initMap() {

    // create map object to display on site with specific coordinates
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 20.8911, lng: -156.3926},
        zoom: 10
    });

    // create an InfoWindow object to attach to each marker
    infoWindow = new google.maps.InfoWindow();


    // iterate through all locations, in array, and create markers on map
    for (var i = 0; i < locations.length; i++) {
            //create a new marker
            marker = new google.maps.Marker({
                map: map,
                position: locations[i].coordinates,
                title: locations[i].name,
                animation: google.maps.Animation.DROP,
            });

            // push new marker into "markers" array
            markers.push(marker);

            // link list and map markers
            appViewModel.listLocations()[i].marker = marker;

            // Add an onclick event  listener to open an infowindow when map marker is clicked
            marker.addListener('click', function() {
                // call "populateInfoWindow" function that populates InfoWindow with data
                populateInfoWindow(this, infoWindow);
            });
    } // end of for loop
} // end of initMap function


// Setup googleMapError function to be called to display alert message if map does not load
function googleMapError() {
    alert("Google Map could not be loaded at this moment. Please try again later");
}

// Display all data in InfoWindow retrieved from foursquare api
function populateInfoWindow(marker, infoWindow) {

    // create "venur" and "InfoWindowOutput" variable outside of ajax for faster processing
    var venue;
    var infoWindowOutput;

    // initiate ajax request for foursquare api data (https://developer.foursquare.com/docs/)
    $.ajax({
        //  type: 'GET',
        url: foursquareLoginData.url,
        dataType: foursquareLoginData.dataType,
        data: {
            client_id: foursquareLoginData.clientID,
            client_secret: foursquareLoginData.clientSecret,
            query: marker.title,
            near: foursquareLoginData.searchNear,
            v: foursquareLoginData.requestDate // version equals date
        },
        success: function(data) {
            // get venue data
            venue = data.response.venues[0];

            // check to see whether any data is returned
            if (venue === null) {
                infoWindowOutput = "<div class='name'>No Venues are found. Please try again later.</div>";
            }
            else {
                // populates infowindow with retrieved data
                infoWindowOutput = "<div class='name'>" + "Name: " + "<span class='info'>" + marker.title + "</span></div>" +
                                "<div class='address'>" + "Location: " + "<span class='info'>" + venue.location.formattedAddress[0] + "</span></div>" +
                                "<div class='foursquareInfo'>" + "Foursquare info: " + "<a href='" + foursquareLoginData.venueLink + venue.id + "'>" + "Link" + "</a></div>";
            } // end of "if-else"

            // set InfoWindow with prepared  "infoWindowOutput" data
            infoWindow.setContent(infoWindowOutput);

            // create animation to bounce 2 sec when marker is clicked
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2000);

            //open "InfoWindow" window with data
            infoWindow.open(map, marker);

            // add event listnener to close the InfoWindow when it is closed
            infoWindow.addListener('closeclick', function() {
                infoWindow.setMarker = null;
            });
        },
        error: function() {
            alert('Foursquare data could not be loaded at this moment. Please try again later.');
        } // enf of "success-error" block
    }); // end of ajax call
} // end of populateInfoWindow

// Location object Constructor
var Location = function(data) {
    // Instantiate self variable to reference Location
    var self = this;
    self.title = data.name;
    self.location = data.coordinates;
    self.isShown = ko.observable(true);
};

// VIEWMODEL as a function //
var ViewModel = function() {
    // Instantiate self variable to reference ViewModel
    var self = this;
    // define "lictLocations" and "usrFilterInput" as observable array and observable item
    self.listLocations = ko.observableArray();
    self.userFilterInput = ko.observable('');

    //iterate through locations array and add each location into list
    for (var i = 0; i < locations.length; i++) {
        self.listLocations.push(new Location(locations[i]));
    }

    // create computed function to track user input and make updates in list and map accordingly
    self.searchFilter = ko.computed(function() {
        // set a variablle to track user input
        var userInput = self.userFilterInput().toLowerCase();
        var currentLocation;

        // iterate through "listLocations" observable array
        for (var j = 0; j < self.listLocations().length; j++) {
            currentLocation = self.listLocations()[j];

            // filter "listLocations" items as per user inputs
            if (currentLocation.title.toLowerCase().indexOf(userInput) > -1) {
                // shows only locations that match user input and items in list/map
                currentLocation.isShown(true);

                // show the ones that match
                if (currentLocation.marker) {
                    currentLocation.marker.setVisible(true);
                }
            } else {
                currentLocation.isShown(false);
                if (currentLocation.marker) {
                    currentLocation.marker.setVisible(false);
                }
            }
        } // end of for loop
    }); // end of computed function

    // trigger marker open event (on the map) when list item is clicked
    self.clickedLocationOnMap = function(clickedListItem) {
        google.maps.event.trigger(clickedListItem.marker, 'click');
    };
};

// instantiate/create new the ViewModel object
var appViewModel = new ViewModel();

// apply binding to new "appViewModel" object
ko.applyBindings(appViewModel);
