window.initMap = function(){
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 11,
          center: {lat: -34.397, lng: 150.644}
        });
        var geocoder = new google.maps.Geocoder();
        var infoWindow = new google.maps.InfoWindow({map: map});
	geocodeAddress(geocoder, map);
        
        
	if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('You are here');
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
      }

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');

        
        
      }
      var arr = [];
      var i = 0, j = 0;
      
     
      function geocodeAddress(geocoder, resultsMap) {
        
		  {% for i in info %} 
		  var add = "{{ i['add'] }}";
		  address = add;
		  geocoder.geocode({'address': address}, function(results, status) {

		  if (status === google.maps.GeocoderStatus.OK) {
		    resultsMap.setCenter(results[0].geometry.location);
		     var marker = new google.maps.Marker({
		      map: resultsMap,
		      position: results[0].geometry.location });
		       arr[i++] = results[0].geometry.location;
		       addInfoWindow(marker, '<center><p><strong>Shibira</strong><br/></p><p id = "name"><strong>{{ i["name"]}}</strong> <br/><strong> venue:</strong><br/> {{ i["add"]}}<br/><strong> Date <strong><br/><strong> From:  </strong>{{ i["fromdate"]}}<strong> to:</strong>  {{ i["todate"]}}<br/> <strong>Timming</strong> <br/><strong> from:</strong> {{ i["starttime"]}}<strong> to:</strong> {{ i["endtime"]}}<br/> <a href=\'join?shibira_id={{ i["name"] }}\'>click to register</a></p> ');
		  } else {
		    alert('Geocode was not successful for the following reason: ' + status);
		  }
		});{% endfor %}
	      }
      
       
	function addInfoWindow(marker, message) {

            var infoWindow = new google.maps.InfoWindow({
                content: message
            });

            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.open(map, marker);
            });
        }
	


