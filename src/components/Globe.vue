<template>
  <link href="https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css" rel="stylesheet"> <!-- Mapbox CSS stylesheet. must be imported for marker functionality-->
    <div>
      <!-- Map -->
      <div id="map" ref="mapContainer"></div>
      <!-- Sidebar for map tools -->
      <div class="sidebar" :class="{ open: sidebarOpen }">
        <nav>
        <!--Link back to homepage (if required)-->
        <RouterLink to="/">
          <i class="pi pi-home"></i> <span class="nav-text">Home</span>
        </RouterLink>
        <button id="btn-export" @click="exportRoutes">
          <i class="pi pi-download"></i> <span class="nav-text">Export Route</span>
        </button>
        <!--Get routes button-->
        <button id="btn-export" @click="toggleTrip">
          <i class="pi pi-search"></i> <span class="nav-text">Get Route Posts</span>
        </button>
        <!--Get routes button-->
        <button id="btn-export" @click="populatePins(tripIdValue)">
          <i class="pi pi-lock"></i> <span class="nav-text">Save Route</span>
        </button>
        <!--Help button-->
        <button id ="btn-help" @click="toggleHelp">
          <i class="pi pi-question-circle"></i> <span class="nav-text">Help</span>
        </button>
        </nav>
      </div>

      <!-- Help button instructions that will pop up when help is clicked -->
      <div v-if="showHelp" class="help-button">
        <h4>🌎 Globe Instructions:</h4>
            <ul>
              <li>Scroll Wheel/Pinch to zoom in or out.</li>
              <li>Hold Left-Click to pan across the screen.</li>
              <li>Hold Right-Click to rotate the globe.</li>
            </ul>
            <h4>🌎 Sidebar Tools:</h4>
            <ul>
              <li>🟥 Left-click on any location to add a pin.</li>
              <li>📝 Fill in your pins with any details you like!</li>
              <li>🟥 Continue adding as many pins as you would like!
              <ul>
                <li>Routes will be constructed in chronological order.</li>
                <li>Pins automatically get saved as you place them. To delete them, navigate to the homepage to delete specific blogposts.</li>
                <li>🟩 Green represents saved routes and pins. Click "Save Route" to verify your route!</li>
                <li>🟥 Red represents routes and pins currently being edited.</li>
              </ul>
              </li>
              <li>📥 Use "Export Route" to download your pins.</li>
              <li>🔎 Use "Get Route Posts" to view all your blogposts from your trip.</li>

            </ul>
            <button id="help-exit" @click="exitHelp">Close</button>
      </div>

      <!-- Floating form for note input -->
      <div v-if="showForm" class="note-form">
        <h2>Add a Blog Post</h2>
        <textarea v-model="noteText" placeholder="Jot down your memories here!"></textarea>
        <input type="date" placeholder="Date" v-model="noteDate"/>
        <button @click="saveNote">Save</button>
        <button @click="cancelNote">Cancel</button>
      </div>

      <!-- Table containing elements from the Trip table -->
      <div v-if="showTrips" class="trip-data">
        <h2>Current Blog Posts</h2>
        <table class="trip-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trip in trips" :key="trip.id">
              <td>{{ trip.id }}</td>
              <td>{{ trip.content }}</td>
              <td>{{ trip.blog_date }}</td>
            </tr>
          </tbody>
        </table>
        <button id="trip-exit" @click="exitTrip">Close</button>
      </div>
    </div>
  </template>
  
  <script>
  import mapboxgl from 'mapbox-gl'; //npm install mapbox-gl if not installed
  import '../assets/globe.css'; //Import CSS for the map
  
  export default {
    //Default data
    data() {
      return {
        map: null,
        userInteracting: false,
        maxSpinZoom: 5,
        slowSpinZoom: 3,
        showHelp: true,
        showTrips: false,
        //Note data (includes the text, location, timestamp)
        showForm: false,
        noteText: '',
        noteCoords: null,
        tripIdValue: null,
        //Pin & route data
        route: [],
        routePins: [],
        trips: [],
        markerColor: '#ff0000', // Default color for the pin (blue)
      };
    },
    mounted() { //Lifecycle hook for when map is mounted
      //Mapbox API key
      mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGZhbCIsImEiOiJjbG9zdm01ZTUwM2Z2Mm1wZnBoejRwMXJkIn0.ggOWShYeI5kjQ4eWD7REbA'; //API key (mapbox)
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/standard-satellite', //Satellite style for map. Shows countries, roads, etc (can be changed)
        projection: 'globe', //Globe projection
        zoom: 13, // Default zoom into Toronto
        center: [-79.3832,43.6532], //Initial centering for map onto Toronto
      });
  
      this.map.on('style.load', () => {
        this.map.setFog({});
      });
  
      console.log(this.showTrips);
      this.setupEventListeners();
      this.tripIdValue = new URL(window.location.href).searchParams.get("tripId");
      console.log(this.tripIdValue);
      this.populatePins(this.tripIdValue);
    },
    methods: {
      //Interaction listeners for map
      setupEventListeners() {
        const map = this.map;
        
        //Event listeners for map interaction
        map.on('mousedown', () => this.userInteracting = true);
        map.on('mouseup', () =>  this.userInteracting = false);
        map.on('dragend', () =>  this.userInteracting = false);
        map.on('pitchend', () => this.userInteracting = false);
        map.on('rotateend', () => this.userInteracting = false);

        // Left click event
        map.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          this.noteCoords = e.lngLat
          this.showForm = true;
          this.markerColor = '#ff0000';
        });
      },
      //Function that adds the pin to the map and saves any associated data with it
      async saveNote() {
        if (!this.noteText.trim()) {
          alert('Note is empty!')
          return; // Ignore empty notes
        }

        if (!this.noteDate) {
          alert('Please select a date!');
          return; // Ignore empty dates
        }

        const timestamp = new Date().toLocaleString();  //Mark the time of note creation
        const { lng, lat } = this.noteCoords; //Extract longitude and latitude from note coordinates

        // Reverse geocode the coordinates to extract city and country
        const { city, country } = await this.reverseGeocode(lng, lat);

        //Create the popup and set the text according to the user input, as well as date/time, coordinates, and location
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }) 
          .setHTML(`
            ${this.noteText}<hr>
            <strong>Date:</strong> ${this.noteDate}<br>
            <strong>Lat:</strong> ${lat.toFixed(4)}, <strong>Lng:</strong> ${lng.toFixed(4)}<br>
            <strong>Location:</strong> ${city}, ${country}
          `);

        // Create the pin for the map and set the location to the lat and lng of the click. Attach the popup to the pin and add it to the map
        const pin = new mapboxgl.Marker({color: this.markerColor})
          .setLngLat([lng, lat])
          .setPopup(popup) //Add the popup to the marker
          .addTo(this.map);

        //Show the popup for the associated pin when hovering over it, and hide it when not hovering
        pin.getElement().addEventListener('mouseenter', () => popup.addTo(this.map));
        pin.getElement().addEventListener('mouseleave', () => popup.remove());

        //Push pin to array
        this.routePins.push({ pin, text: this.noteText, date: this.noteDate, time: timestamp, coordinates: this.noteCoords, location: { city, country } });
        
        //Send POST request to database
        this.postOne({
          text: this.noteText,
          date: this.noteDate,
          coordinates: this.noteCoords,
        });

        // Sort array by date for chronological route planning
        this.routePins.sort((a, b) => new Date(a.date) - new Date(b.date));
        // Update array of routes based on the sorted pins
        this.route = this.routePins.map(({ coordinates }) => [coordinates.lng, coordinates.lat]);

        this.drawRoute('#ff0000'); //Draw a red line between points (signifying an unsaved route)
        
        //Reset form for a new note
        this.showForm = false;
        this.noteText = '';
        this.noteCoords = null;
      },
    // Reset function in case the user doesn't want to save the note
    cancelNote() {
      this.showForm = false;
      this.noteText = '';
      this.noteCoords = null;
    },
    //Function to convert the coordinates of a pin and extract the city and country of the location the pin was placed at
    async reverseGeocode(lng, lat) {
      //API call using latitude and longitude coorinates and API token
      const accessToken = mapboxgl.accessToken;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&types=place,country`;

      // If the coordinates contain city and country data, extract it and return the names. Otherwise show unknown or call an error
      try {
        const response = await fetch(url);
        const data = await response.json();

        //If there are features from the coordinates
        if (data && data.features && data.features.length > 0) {
          let city = '';
          let country = '';

          //Go through all features available, but only extract country and city (can get more if required)
          for (const feature of data.features) {
            if (feature.place_type.includes('place')) {
              city = feature.text;
            }
            if (feature.place_type.includes('country')) {
              country = feature.text;
            }
          }

          return { city, country };
        } else {
          return { city: '?', country: '?'};
        }
      } catch (err) { //Throw error if API call fails
        console.error('Reverse geocoding failed:', err);
        return { city: 'Error', country: 'Error' };
      }
    },
    //Function to draw a route between marked points
    async drawRoute(color) {
      if (this.route.length < 2) return; // Need at least 2 points

      //Format coordinate string to match requirement for api call
      const coordinatesStr = this.route.map(coord => coord.join(',')).join(';');
      const accessToken = mapboxgl.accessToken;

      //Call directions api
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesStr}?geometries=geojson&access_token=${accessToken}`;

      try {
        //Receive a response from the api
        const response = await fetch(url);
        const data = await response.json();

        //Throw an alert if there wwas no route found (i.e. marker placed on a mountain)
        if (!data.routes || data.routes.length === 0) {
          alert('No route found!');
          return;
        }

        //Format the route data into GeoJSON format for mapbox
        const routeGeoJSON = {
          type: 'Feature',
          geometry: data.routes[0].geometry
        };

        // If a line already exists, update the line.
        if (this.map.getSource('routeLine')) {
          this.map.getSource('routeLine').setData(routeGeoJSON);
          this.map.setPaintProperty('routeLineLayer', 'line-color', color);
        } else { //Otherwise, create a new line
          this.map.addSource('routeLine', {
            type: 'geojson',
            data: routeGeoJSON
          });

          //Add the line to the map
          this.map.addLayer({
            id: 'routeLineLayer',
            type: 'line',
            source: 'routeLine',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': color,
              'line-width': 4
            }
          });
        }
      } catch (err) { //Throw an error if the API call fails
        console.error('Error fetching route:', err);
        alert('Error fetching route');
      }
    },
    //Function to export a route to a JSON
    async exportRoutes() {
      // Trigger an alert if there are no pins to delete
      if (this.route.length === 0) {
        alert('No route to export!');
        return;
      }
      // Export routePins to JSON
      const routePinsData = this.routePins.map(({ text, date, time, coordinates, location }) => ({
        text,
        date,
        time,
        coordinates,
        location,
      }));

      //Create a downloable JSON file link
      const blob = new Blob([JSON.stringify(routePinsData, null, 2)], { 
        type: 'application/json' 
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);;
      link.download = 'routePins.json';
      link.click();
    },
    //Function to call a POST request to the posts table in the database
    async postOne(pinData) {
      try {
        const response = await fetch(`http://localhost:3001/trips/${this.tripIdValue}/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Convert the pin data to JSON and send it to the db
          body: JSON.stringify({
            trip_id: this.tripIdValue,
            content: pinData.text,
            latitude: pinData.coordinates.lat,
            longitude: pinData.coordinates.lng,
            blog_date: pinData.date,
          }),
        });

        //Error checking for POST response
        if (!response.ok) {
          console.error('Failed to post pin:', await response.text());
        } else {
          console.log('Successfully posted pin:', pinData.text);
        }
      } catch (error) {
        console.error('Error posting pin:', error);
      }
    },
     //Function to populate the map with pins from the database
     async populatePins(tripId) {
      try {
        //Call GET requests for all posts associated with the trip
        const response = await fetch(`http://localhost:3001/trips/${tripId}/posts`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        //Error checking for GET response
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        //Take the response and add it to an array
        const data = await response.json();
        this.previousPins = data;

        //Sort the saved pins by date for chronological order
        this.previousPins.sort((a, b) => new Date(a.blog_date) - new Date(b.blog_date));

        // Clear any routes in the array (if any)
        this.route = [];

        // Iterate over the saved pins and push the data to the primary arrays that hold route and pin data
        for (const pinData of this.previousPins) {
          const { latitude, longitude, content, blog_date } = pinData;
          console.log(latitude, longitude, content, blog_date);

          // Add the pin coordinates to the route array
          this.route.push([longitude, latitude]);

          // Add the pin data to the routePins array 
          this.routePins.push({
            text: content,
            date: blog_date,
            coordinates: { lat: latitude, lng: longitude },
          });

          // Reverse geocode the coordinates to extract city and country
          const { city, country } = await this.reverseGeocode(longitude, latitude);

          //Create the popup for each saved pin
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(`
              ${content}<hr>
              <strong>Date:</strong> ${blog_date}<br>
              <strong>Lat:</strong> ${latitude.toFixed(4)}, <strong>Lng:</strong> ${longitude.toFixed(4)}<br>
              <strong>Location:</strong> ${city}, ${country}
            `);

          // Create the pin, set it to its saved coordinates, and add it to the map in a green color (signifying it was a saved pin)
          const pin = new mapboxgl.Marker({ color: '#32CD32' })
            .setLngLat([longitude, latitude])
            .setPopup(popup) // Attach the popup to the marker
            .addTo(this.map);

          // Add mouseenter and mouseleave events to the marker
          pin.getElement().addEventListener('mouseenter', () => popup.addTo(this.map));
          pin.getElement().addEventListener('mouseleave', () => popup.remove());
        }

        // Draw the route between the pins using green 
        this.drawRoute('#32CD32');

      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    },
    // Function which calls a GET request see all the posts associated with the trip
    async getRoutes() {
      try {
        //Try getting all elements from the blog_post table
        const response = await fetch(`http://localhost:3001/trips/${this.tripIdValue}/posts`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        //Error checking if the request failed
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        //Parse the response and send it to an array for diaplsy
        const data = await response.json();
        this.trips = data;

      } catch (error) {
        console.error('Error fetching routes:', error); // Catch any errors that may appear
      }
    },
    //Toggle trip popup
    toggleTrip() {
      this.getRoutes();
      this.showTrips = !this.showTrips; 
    },
    //Exit button functionality for trip menu
    exitTrip() {
      this.toggleTrip();
    },
    //Toggle help popup
    toggleHelp() {
      this.showHelp = !this.showHelp; 
    },
    //Exit button functionality for help menu
    exitHelp(){
      this.toggleHelp();
    }
    }
  };
  </script>