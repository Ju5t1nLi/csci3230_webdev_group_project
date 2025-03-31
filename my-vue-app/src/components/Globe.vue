<template>
    <div>
      <!-- Map + rotation button -->
      <div id="map" ref="mapContainer"></div>
      <button id="btn-spin" @click="toggleSpin">{{ spinEnabled ? 'Pause rotation' : 'Start rotation' }}</button>
    </div>
  </template>
  
  <script>
  import mapboxgl from 'mapbox-gl'; //npm install mapbox-gl if not installed
  
  export default {
    //Default data
    data() {
      return {
        map: null,
        spinEnabled: true,
        userInteracting: false,
        secondsPerRevolution: 120,
        maxSpinZoom: 5,
        slowSpinZoom: 3,
      };
    },
    mounted() { //Lifecycle hook for when map is mounted
      //Mapbox API key. You can make one by signing up for a mapbox account
      mapboxgl.accessToken = ''; //API key (mapbox)
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/standard-satellite', //Satellite style for map. Shows countries, roads, etc
        projection: 'globe', //Globe projection, can be swapped
        zoom: 1.5,
        center: [-90, 40],
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
  </style>