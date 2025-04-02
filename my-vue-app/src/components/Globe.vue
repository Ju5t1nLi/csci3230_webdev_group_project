<template>
  <link href="https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css" rel="stylesheet"> <!-- Mapbox CSS stylesheet. must be imported for marker functionality-->
    <div>
      <!-- Map + rotation button -->
      <div id="map" ref="mapContainer"></div>
      <button id="btn-spin" @click="toggleSpin">{{ spinEnabled ? 'Pause rotation' : 'Start rotation' }}</button>

      <!-- Floating form for note input -->
      <div v-if="showForm" class="note-form">
        <h2>Add a Memory</h2>
        <textarea v-model="noteText" placeholder="Jot down your memories here!"></textarea>
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
        spinEnabled: false, //Disabled spinning for now. May be too distracting for users
        userInteracting: false,
        secondsPerRevolution: 120,
        maxSpinZoom: 5,
        slowSpinZoom: 3,
        //Note data (includes the text, location, timestamp)
        showForm: false,
        noteText: '',
        noteLocation: null,
        pins: [] //Array to hold all the pins for backend storage
      };
    },
    mounted() { //Lifecycle hook for when map is mounted
      //Mapbox API key. You can make one by signing up for a mapbox account
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
      this.spinGlobe();
    },
    methods: {
      //Function for globe spin. Automatically rotates and can be disabled by a button
      spinGlobe() {
        if (!this.spinEnabled || this.userInteracting || this.map.getZoom() >= this.maxSpinZoom) return;
        
        let distancePerSecond = 360 / this.secondsPerRevolution;
        if (this.map.getZoom() > this.slowSpinZoom) {
          let zoomDif = (this.maxSpinZoom - this.map.getZoom()) / (this.maxSpinZoom - this.slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        
        let center = this.map.getCenter();
        center.lng -= distancePerSecond;
        this.map.easeTo({ center, duration: 1000, easing: (n) => n });
      },
      //Interaction listeners for map
      setupEventListeners() {
        const map = this.map;
        
        map.on('mousedown', () => this.userInteracting = true);
        map.on('mouseup', () => { this.userInteracting = false; this.spinGlobe(); });
        map.on('dragend', () => { this.userInteracting = false; this.spinGlobe(); });
        map.on('pitchend', () => { this.userInteracting = false; this.spinGlobe(); });
        map.on('rotateend', () => { this.userInteracting = false; this.spinGlobe(); });
        map.on('moveend', () => this.spinGlobe());

        // Listen for clicks and log latitude/longitude for pin location, then show the form to add a note
        map.on('click', (e) => {
          this.userInteracting = true;
          this.noteLocation = e.lngLat;
          this.showForm = true;
        });
      },
      //Function that adds the pin to the map and saves any associated data with it
      saveNote() {
        if (!this.noteText.trim()) return; // Ignore empty notes

        const timestamp = new Date().toLocaleString(); //Mark the time of note creation

        //Create the popup and set the text according to the user input, as well as date/time and location
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false}) 
          .setHTML(`
            ${this.noteText}<hr>
            <strong>Date/Time:</strong> ${timestamp}<br>
            <strong>Lat:</strong> ${this.noteLocation.lat.toFixed(4)}, 
            <strong>Lng:</strong> ${this.noteLocation.lng.toFixed(4)}
          `);
          
        // Create the pin for the map and set the location to the lat and lng of the click. Attach the popup to the pin and add it to the map
        const pin = new mapboxgl.Marker()
          .setLngLat([this.noteLocation.lng, this.noteLocation.lat])
          .setPopup(popup) // Add popup to marker
          .addTo(this.map);

        // Show the popup for the associated pin when hovering over it
        pin.getElement().addEventListener('mouseenter', () => {
          popup.addTo(this.map);
        });

        // Hide popup when not hovering over it
        pin.getElement().addEventListener('mouseleave', () => {
          popup.remove();
        });

        this.pins.push({ pin, text: this.noteText, timestamp, location: this.noteLocation });

        this.showForm = false;
        this.noteText = '';
        this.noteLocation = null;
        console.log(this.pins);
      },
      cancelNote() {
        this.showForm = false;
        this.noteText = '';
        this.noteLocation = null;
      },
      //Function to toggle spin on and off
      toggleSpin() {
        this.spinEnabled = !this.spinEnabled;
        if (this.spinEnabled) {
          this.spinGlobe();
        } else {
          this.map.stop();
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
  /*Button styling*/
  #btn-spin {
    font: bold 12px/20px 'Helvetica Neue', Arial, sans-serif;
    background-color: #3386c0;
    color: #fff;
    position: absolute;
    top: 20px;
    left: 50%;
    z-index: 1;
    border: none;
    width: 200px;
    margin-left: -100px;
    display: block;
    cursor: pointer;
    padding: 10px 20px;
    border-radius: 3px;
  }
  /*Button hover color*/
  #btn-spin:hover {
    background-color: #4ea0da;
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