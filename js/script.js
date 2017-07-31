var infoWindow, map;

ko.bindingHandlers.slideVisible = {
    init: function(element, valueAccessor) {
        var shouldDisplay = valueAccessor();
        shouldDisplay() ? $(element).slideDown() : $(element).slideUp();
    },
    update: function(element, valueAccessor) {
        var shouldDisplay = valueAccessor();
        shouldDisplay() ? $(element).slideDown() : $(element).slideUp();
    } 
};

ko.bindingHandlers.slideWeatherChannel = {
    init: function(element, valueAccessor) {
        var shouldDisplay = valueAccessor();
        shouldDisplay() ? $(element).width(350) : $(element).width(50);
    },
    update: function(element, valueAccessor) {
        var shouldDisplay = valueAccessor();
        shouldDisplay() ? $(element).animate({ width: '350' }, 1000) : $(element).animate({ width: '50' }, 1000);
    } 
};

ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
        var shouldDisplay = valueAccessor();
        shouldDisplay() ? $(element).show() : $(element).hide();
    },
    update: function(element, valueAccessor) {
        var shouldDisplay = valueAccessor();
        shouldDisplay() ? $(element).fadeIn() : $(element).fadeOut();
    } 
};

var placeList = [
	{
		title: 'Alma Mater', 
		location: { lat: 40.807931, lng: -73.962140 },
		streetAddress: '116th broadway', 
		cityAddress: 'New York, NY 10027',
		wikiTitle: 'Alma_Mater_(New_York_sculpture)'
	},
	{
		title: 'Riverside Church', 
		location: { lat: 40.811873, lng: -73.963165 },
		streetAddress: '490 Riverside Dr',
		cityAddress: 'New York, NY 10027',
		wikiTitle: 'Riverside_Church'
	},
	{
		title: "Grant's Tomb", 
		location: { lat: 40.813460, lng: -73.963104 },
		streetAddress: 'W 122nd St & Riverside Dr', 
		cityAddress: 'New York, NY 10025',
		wikiTitle: "Grant's_Tomb"
	},
	{
		title: 'Sakura Park', 
		location: { lat: 40.812773, lng: -73.962273 },
		streetAddress: '500 Riverside Dr', 
		cityAddress: 'New York, NY 10027',
		wikiTitle: 'Sakura_Park'
	},
	{
		title: 'Cathedral of Saint John the Divine', 
		location: { lat: 40.803831, lng: -73.961885 },
		streetAddress: '1047 Amsterdam Ave', 
		cityAddress: 'New York, NY 10025',
		wikiTitle: 'Cathedral_of_Saint_John_the_Divine'
	}
];

var viewModel = {
	query: ko.observable(''),
	panelVisible: ko.observable(($(window).width() >= 700) && ($(window).height() >= 600)),
	weatherVisible: ko.observable(false),
	errorMessage: ko.observable(),
	weatherInfo: ko.observable("Loading weather information")
};

viewModel.togglePanel = function() {
	this.panelVisible(!this.panelVisible());
};

viewModel.toggleWeather = function() {
	this.weatherVisible(!this.weatherVisible());
};

// search function
viewModel.places = ko.computed(function() {
        var query = this.query().toLowerCase();
        if (query && query.length > 0) {
        	var l = ko.utils.arrayFilter(placeList, function(place) {
        		var visible = place.title.toLowerCase().indexOf(query) >= 0;
        		place.marker.setVisible(visible);
        		return visible;
        	});
        	return l;
        } else {
        	placeList.forEach(function(place) { if (place.marker) place.marker.setVisible(true); });
        	return placeList;
        }
    }, viewModel);

viewModel.navigatePlace = function(place) {
	if (!place.marker) return;

  	if (!infoWindow)
  		infoWindow = new google.maps.InfoWindow({
  			maxWidth: 200
  		});
  	var contentString;
  	if (place.wikiContent)
  		contentString = place.wikiContent;
  	else
  		contentString = "<p>Loading wikipedia content</p>";

	infoWindow.setContent(contentString);

	toggleBounce(place.marker);
	infoWindow.open(map, place.marker);
	map.setCenter(place.location);
	map.setZoom(16);
};

$(window).resize(function() {
	viewModel.panelVisible(($(window).width() >= 700) && ($(window).height() >= 600));
});

function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null); }, 750);
  }
}

function initialize() {
	if (viewModel.errorMessage() == "Can't load google maps API!")
		viewModel.errorMessage(null);
	map = new google.maps.Map(document.getElementById('map-canvas'), {
		zoom: 15,
		center: {lat: 40.807931, lng: -73.960000},
		disableDefaultUI: true
		});

	placeList.forEach(function(place) {
		place.marker = new google.maps.Marker({
			position: place.location,
			title: place.title,
			map: map,
			animation: google.maps.Animation.DROP
		});

		place.marker.addListener('click', (function(place) {
			return function() {
				viewModel.navigatePlace(place);
			};
		})(place));
	});
}

ko.applyBindings(viewModel);
// Error handling, if google maps API isn't loaded
function mapError() {
	viewModel.errorMessage("Can't load google maps API!");
}

$(document).ready(function() {

	// Loading weather information
	var queryUrl = 'http://api.openweathermap.org/data/2.5/weather?zip=10027,us&appid=4f9262fd4c3e7e01d8fd082f268bb68a';
	$.getJSON(queryUrl, function(result) {
		//success
		if (result.cod != 200) {
			// server error
			viewModel.weatherInfo('Error loading weather information');
		} else {
			var infoString = 'Weather: ' + result.weather[0].description;
			infoString += '\n' + 'Temperature: ' + (result.main.temp - 273.15).toFixed(1) + '°C';
			viewModel.weatherInfo(infoString);
		}
	}).fail(function() {
		// error loading weather information
		viewModel.weatherInfo('Error loading weather information');
	});

	// fetch wikipedia information
	placeList.forEach(function(place) {
	  	$.ajax({
	  		url: "http://en.wikipedia.org/w/api.php",
	  		jsonp: "callback",
	  		dataType: "jsonp",
	  		data: {
	  			action: "query",
	  			prop: "extracts",
	  			format: "json",
	  			titles: place.wikiTitle
	  		},
	  		xhrField: { withCredentials: true },
	  		success: (function(place) {
		  			return function(result) {
							if ('error' in result) {
								place.wikiContent = "<p>Error loading wikipedia information.</p>";
							} else {
								var key = Object.keys(result.query.pages)[0];
								if (key == '-1' || !("extract" in result.query.pages[key]))
									place.wikiContent = "<p>Error loading wikipedia information.</p>";
								else {
									place.wikiContent = "<p>" + result.query.pages[key].extract.substring(0, 300) + '...</p><p>See <a href="https://en.wikipedia.org/wiki/' + encodeURI(place.wikiTitle) + '">Wikipedia</a></p>';
								}
							}
						};
				})(place),
			error: (function(place) {
					return function() {
						// error loading wikipedia information
						place.wikiContent = "<p>Error loading wikipedia information.</p>";
					};
				})(place)
		});
	});
});


