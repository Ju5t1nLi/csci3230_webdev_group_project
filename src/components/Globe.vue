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
        <!--Export button for json conversion and db storage-->
        <button id="btn-export" @click="exportPins">
          <i class="pi pi-thumbtack"></i> <span class="nav-text">Export Pins</span>
        </button>
        <button id="btn-export" @click="exportRoutes">
          <i class="pi pi-download"></i> <span class="nav-text">Export Route</span>
        </button>
        <!--Delete button for all pins on the map-->
        <button id="btn-delete" @click="deleteAllPins">
          <i class="pi pi-trash"></i> <span class="nav-text">Delete All Pins</span>
        </button>
        <!--Delete route button-->
        <button id ="btn-delete" @click="clearRoute">
          <i class="pi pi-eraser"></i> <span class="nav-text">Clear Route</span>
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
              <li>🟦 Left-click on any location to add a blue pin.
              <ul>
                <li>This is useful for marking specific points that you want to keep track of!</li>
              </ul>
              </li>
              <li>🟥 Right-click to add a red pin for creating a trip route.
              <ul>
                <li>All red pins will be connected to each other in a route.</li>
                <li>Only 1 route can be made at a time.</li>
              </ul>
              </li>
              <li>📝 Fill in your pins with any details you like!</li>
              <li>📥 Use "Export Pins" or "Export Route" to save your pins.</li>

              <li>🗑️ "Delete All Pins" will remove all blue pins. "Clear Route" removes red pins and paths.</li>
            </ul>
            <button id="help-exit" @click="exitHelp">Close</button>
      </div>

      <!-- Floating form for note input -->
      <div v-if="showForm" class="note-form">
        <h2>Add a Memory</h2>
        <textarea v-model="noteText" placeholder="Jot down your memories here!"></textarea>
        <input type="date" placeholder="Date" v-model="noteDate"/>
        <button @click="saveNote">Save</button>
        <button @click="cancelNote">Cancel</button>
      </div>
    </div>
  </template>
  
  <script>
  import mapboxgl from 'mapbox-gl'; //npm install mapbox-gl if not installed
  import '../assets/Globe.css'; //Import CSS for the map
  
  export default {
    //Default data
    data() {
      return {
        map: null,
        userInteracting: false,
        secondsPerRevolution: 120,
        maxSpinZoom: 5,
        slowSpinZoom: 3,
        showHelp: true,
        //Note data (includes the text, location, timestamp)
        showForm: false,
        noteText: '',
        noteCoords: null,
        //Pin & route data
        pins: [], //Array to hold all the pins for backend storage
        route: [],
        routePins: [],
        markerColor: '#0000ff', // Default color for the pin (blue)
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
  
      this.setupEventListeners();
    },
    methods: {
      //Interaction listeners for map
      setupEventListeners() {
        const map = this.map;
        
        map.on('mousedown', () => this.userInteracting = true);
        map.on('mouseup', () =>  this.userInteracting = false);
        map.on('dragend', () =>  this.userInteracting = false);
        map.on('pitchend', () => this.userInteracting = false);
        map.on('rotateend', () => this.userInteracting = false);

        // Listen for clicks and log latitude/longitude for pin location, then show the form to add a note
        map.on('click', (e) => {
          this.userInteracting = true;
          this.noteCoords = e.lngLat;
          this.showForm = true;
          this.markerColor = '#0000ff';
        });

        // Right click event
        map.on('contextmenu', (e) => {
          const { lng, lat } = e.lngLat;
          this.noteCoords = e.lngLat
          this.showForm = true;
          this.markerColor = '#ff0000';
          this.route.push([lng, lat]);
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

        // Save the note to array based on the marker color
        if (this.markerColor === '#0000ff') { // Blue marker (regular pin)
          this.pins.push({ pin, text: this.noteText, date: this.noteDate, coordinates: this.noteCoords, location: { city, country } });
        } else if (this.markerColor === '#ff0000') { // Red marker (route pin)
          this.routePins.push({ pin, text: this.noteText, date: this.noteDate, time: timestamp, coordinates: this.noteCoords, location: { city, country } });
          this.drawRoute();
        }

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
      //Delete function to wipe all pins + notes from the map
      deleteAllPins() {
        // Trigger an alert if there are no pins to delete
        if (this.pins.length === 0) {
          alert('No pins to delete!');
          return;
        }
        this.pins.forEach(({ pin }) => pin.remove()); 
        this.pins = [];
      },
      //Export function to convert pin data into a JSON file
      exportPins() {
      //Send an alert if there are no pins to export
      if (this.pins.length === 0) {
        alert('No pins to export!');
        return;
      }
      // Format the pins data into JSON
      const pinData = this.pins.map(({ text, noteDate, coordinates, location }) => ({
        text,
        noteDate,
        lat: coordinates.lat,
        lng: coordinates.lng,
        location: {
          city: location.city,
          country: location.country
        }
      }));

      // Create a blob from the JSON data for file download
      const blob = new Blob([JSON.stringify(pinData, null, 2)], {
        type: 'application/json',
      });

      // Trigger a download of the JSON file. Placeholder functionality for now; can be replaced with a call to backend
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'notes.json'; 
      link.click(); 
      alert('Pins exported successfully!');
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
    async drawRoute() {
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
              'line-color': '#ff0000',
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
    exportRoutes() {
      // Throw an alert if there was no route to export
      if (this.route.length === 0) {
        alert('No route to export!');
        return;
      }

      // Prompt the user for a trip title
      const tripTitle = prompt('Enter a title for your trip:');
      if (!tripTitle || !tripTitle.trim()) {
        alert('Trip title is required!');
        return;
      }

      // Gather and format the route data into JSON
      const routeData = {
      title: tripTitle.trim(),
      pins: this.routePins.map(({text, noteDate, timestamp, coordinates, location}) => ({
        text,
        noteDate,
        timestamp,
        lng: coordinates.lng,
        lat: coordinates.lat,
        location: {
          city: location.city,
          country: location.country
        }
      }))
      };

      // Create a blob from the JSON data for file download
      const blob = new Blob([JSON.stringify(routeData, null, 2)], {
      type: 'application/json'
      });

      // Trigger a download of the JSON file. Placeholder functionality for now; can be replaced with a call to backend
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${tripTitle.trim().replace(/\s+/g, '_')}_route.json`;
      link.click();

      // Trigger an alert and clear the route from the map
      alert('Route exported successfully!');
      this.clearRoute();
    },
    //Wipes the route from the map
    clearRoute() {
      // Trigger an alert if there are is no route to clear
      if (this.route.length === 0) {
        alert('No route to clear!');
        return;
      }
      // Remove red route pins from the map
      this.routePins.forEach(({ pin }) => {if (pin) pin.remove();});

      // Clear route and route pin data
      this.routePins = [];
      this.route = [];
      if (this.map.getSource('routeLine')) {
        this.map.removeLayer('routeLineLayer');
        this.map.removeSource('routeLine');
      }
    },
    //Toggle help popup
    toggleHelp() {
      this.showHelp = !this.showHelp; 
    },
    //Exit button functionality for help menu
    exitHelp(){
      this.toggleHelp();
    },
    }
  };
  </script>