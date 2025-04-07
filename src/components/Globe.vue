<template>
  <link href="https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css" rel="stylesheet"> <!-- Mapbox CSS stylesheet. must be imported for marker functionality-->
    <div>
      <!-- Map -->
      <div id="map" ref="mapContainer"></div>
      <!-- Color picker for marker -->
      <div id="color-picker">
        <label for="marker-color">Pin Color:</label>
        <input type="color" id="marker-color" v-model="markerColor" />
      </div>
      <!-- Sidebar for map tools -->
      <div class="sidebar" :class="{ open: sidebarOpen }">
        <nav>
        <!--Link back to homepage (if required)-->
        <RouterLink to="/">
          <i class="pi pi-home"></i> <span class="nav-text">Home</span>
        </RouterLink>
        <!--Delete button for all pins on the map-->
        <button id="btn-delete" @click="deleteAllPins">
          <i class="pi pi-trash"></i> <span class="nav-text">Delete All Pins</span>
        </button>
        <!--Delete route button-->
        <button id ="btn-delete-route" @click="clearRoute">
          <i class="pi pi-circle"></i> <span class="nav-text">Clear Route</span>
        </button>
        <!--Export button for json conversion and db storage-->
        <button id="btn-export" @click="exportPins">
          <i class="pi pi-download"></i> <span class="nav-text">Export Pins</span>
        </button>
        </nav>
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
  
  export default {
    //Default data
    data() {
      return {
        map: null,
        userInteracting: false,
        secondsPerRevolution: 120,
        maxSpinZoom: 5,
        slowSpinZoom: 3,
        //Note data (includes the text, location, timestamp)
        showForm: false,
        noteText: '',
        noteCoords: null,
        pins: [], //Array to hold all the pins for backend storage
        route: [],
        routePins: [],
        markerColor: '#ff0000', // Default color for the pin
      };
    },
    mounted() { //Lifecycle hook for when map is mounted
      //Mapbox API key
      mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGZhbCIsImEiOiJjbG9zdm01ZTUwM2Z2Mm1wZnBoejRwMXJkIn0.ggOWShYeI5kjQ4eWD7REbA'; //API key (mapbox)
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/standard-satellite', //Satellite style for map. Shows countries, roads, etc (can be changed)
        projection: 'globe', //Globe projection
        zoom: 1.5,
        center: [0,0],
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
        });

        // Right click event
        map.on('contextmenu', (e) => {
          const { lng, lat } = e.lngLat;
          this.noteCoords = e.lngLat
          this.showForm = true;
          this.route.push([lng, lat]);
          this.routePins.push({ coordinates: { lng, lat } });
          this.drawRoute();
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

        //const timestamp = new Date().toLocaleString();  //Mark the time of note creation
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

        // Push data to array
        this.pins.push({ pin, text: this.noteText, date: this.noteDate, coordinates: this.noteCoords, location: {city, country}});

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

      const coordinatesStr = this.route.map(coord => coord.join(',')).join(';');
      const accessToken = mapboxgl.accessToken;

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesStr}?geometries=geojson&access_token=${accessToken}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
          alert('No route found!');
          return;
        }

        const routeGeoJSON = {
          type: 'Feature',
          geometry: data.routes[0].geometry
        };

        // If the layer already exists, just update it
        if (this.map.getSource('routeLine')) {
          this.map.getSource('routeLine').setData(routeGeoJSON);
        } else {
          this.map.addSource('routeLine', {
            type: 'geojson',
            data: routeGeoJSON
          });

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
      } catch (err) {
        console.error('Error fetching route:', err);
        alert('Error fetching route');
      }
    },
    exportRoutes() {
      if (this.route.length === 0) {
        alert('No route to export!');
        return;
      }

      const routeData = {
        coordinates: this.route.map(([lng, lat]) => ({ lng, lat })),
        pins: this.routePins.map(({ coordinates }) => ({
          lng: coordinates.lng,
          lat: coordinates.lat
        }))
      };

      const blob = new Blob([JSON.stringify(routeData, null, 2)], {
        type: 'application/json'
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'route.json';
      link.click();

      alert('Route exported successfully!');
    },
    clearRoute() {
      this.route = [];
      if (this.map.getSource('routeLine')) {
        this.map.removeLayer('routeLineLayer');
        this.map.removeSource('routeLine');
      }
    }
    }
  };
  </script>
  
  <style scoped>
  /*Map styling*/
  #map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }
  #color-picker {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #3386c0;
    padding: 5px 10px;
    z-index: 2;
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bold;
  }

  /* Delete button styling (hidden until sidebar expansion)*/
  #btn-delete {
    font: bold 14px 'Helvetica Neue', Arial, sans-serif;
    background-color: #3386c0;
    color: white;
    border: none;
    width: 150px;
    padding: 10px;
    cursor: pointer;
    opacity: 1; 
    transition: opacity 0.2s ease-in-out;
  }

  /*Change delete button to red upon hover*/
  #btn-delete:hover {
    background-color: red;
    opacity: 1;
  }


  /* Sidebar styling */
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    width: 50px; /* Default width when collapsed */
    background: #3386c0;
    color: white;
    transition: width 0.3s ease-in-out;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
  }

  /* Sidebar expansion on hover */
  .sidebar:hover {
    width: 200px;
  }

  /* Nav item (icon) styling */
  nav {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
    width: 100%;
  }

  /* Don't show text when the sidebar is collapsed */
  .nav-text {
    display: none;
  }

  /* Show text when sidebar is expanded */
  .sidebar:hover .nav-text {
    display: inline;
  }

  /* Export button styling */
  #btn-export {
    font: bold 14px 'Helvetica Neue', Arial, sans-serif;
    background-color: #3386c0;
    color: white;
    border: none;
    width: 150px;
    padding: 10px;
    cursor: pointer;
    opacity: 1;
  }

  /* Export button background color when hovered over*/
  #btn-export:hover {
    background-color: #4ea0da;
  }

    /* Export button styling */
  #btn-delete-route {
    font: bold 14px 'Helvetica Neue', Arial, sans-serif;
    background-color: #3386c0;
    color: white;
    border: none;
    width: 150px;
    padding: 10px;
    cursor: pointer;
    opacity: 1;
  }

  #btn-delete-route:hover {
    background-color: red;
    opacity: 1;
  }

  /* Note form */
  .note-form {
    position: absolute;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    align-self: center;
    background: #3386c0;
    padding: 15px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
    border-radius: 5px;
    width: 250px;
  }

  /* Note form title */
  .note-form h2 {
    font-size: 16px;
    text-align: center;
    color: white;
    font-weight: bold;
  }

  /* Note form input area */
  .note-form textarea {
    width: 100%;
    height: 60px;
    margin-bottom: 10px;
    resize: none;
  }

  /* Note form buttons */
  .note-form button {
    width: 48%;
    padding: 5px;
    margin: 5px 1%;
    cursor: pointer;
    border: none;
    border-radius: 3px;
  }

  /* Note form save button */
  .note-form button:first-of-type {
    background-color: black;
    color: white;
  }

  /* Note form cancel button */
  .note-form button:last-of-type {
    background-color: lightgray;
  }
  </style>