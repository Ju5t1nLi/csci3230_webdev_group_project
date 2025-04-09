<!-- <script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { trips } from '../stores/trip'
// import { fetchTrips, createTrip } from '../app/app'

const router = useRouter()
const showForm = ref(false)
const newTripTitle = ref('')

const addTrip = () => {
  if (!newTripTitle.value.trim()) return
  trips.value.push({
    id: Date.now(),
    title: newTripTitle.value.trim(),
    posts: [],
  })
  newTripTitle.value = ''
  showForm.value = false
}

const goToTrip = (tripId) => {
  router.push({ name: 'Trip', params: { id: tripId } })
}
</script> -->


<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { trips } from '../stores/trip'
import { fetchTrips, createTrip, deleteTrip } from '../app/app'

const router = useRouter()

const showForm = ref(false)
// const trips = ref('')
const newTripTitle = ref('')
const currentUser = '1' 

// Load trips for user on mount
const loadTrips = async () => {
  try {
    const data = await fetchTrips(currentUser)
    trips.value = data
  } catch (err) {
    console.error('Error fetching trips:', err)
  }
}

onMounted(loadTrips)

// Add a trip
const addTrip = async () => {
  const title = newTripTitle.value.trim()
  if (!title) return

  try {
    await createTrip(title, currentUser)
    newTripTitle.value = ''
    showForm.value = false
    await loadTrips()
  } catch (err) {
    console.error('Error adding trip:', err)
  }
}


const removeTrip = async (tripId) => {
  try {
    await deleteTrip(tripId)
    trips.value = trips.value.filter(trip => trip.id !== tripId)
  } catch (error) {
    console.error('Error deleting trip:', error)
  }
}

const goToTrip = (tripId) => {
  router.push({ name: 'Trip', params: { id: tripId } })
}
</script>



<template>
  <div class="home">
    <h1>🌍 Travel Journal</h1>
    <h3>Your planned trips</h3>

    <div class="trip-grid">
      <div
        v-for="trip in trips"
        :key="trip.id"
        class="trip-card"
        @click="goToTrip(trip.id)"
      >
        <button class="delete-btn" @click.stop="removeTrip(trip.id)">🗑️</button>
        <h2>{{ trip.title }}</h2>
      </div>
    </div>

    <button class="add-trip-btn" @click="showForm = true">+</button>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-content">
        <h2>Create a New Trip</h2>
        <input
          v-model="newTripTitle"
          type="text"
          placeholder="Trip Title"
        />
        <div class="modal-actions">
          <button @click="showForm = false">Cancel</button>
          <button @click="addTrip">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
  .home {
    text-align: center;
    padding: 20px;
  }

  .trip-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    padding: 30px;
    max-width: 1000px;
    margin: auto;
  }

  .trip-card {
    position: relative;
    background: white;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .trip-card:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 16px rgba(230, 56, 114, 0.3);
  }

  .add-trip-btn {
    background-color: rgb(230, 56, 114);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 28px;
    font-weight: bold;
    height: 60px;
    width: 60px;
    margin: 30px auto 0;
    display: block;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }

  .add-trip-btn:hover {
    background-color: rgb(212, 46, 100);
    transform: scale(1.05);
  }

  .modal-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  }

  .modal-content input {
    padding: 0.6rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  .modal-actions {
    display: flex;
    justify-content: space-between;
  }

  .modal-actions button {
    background-color: rgb(230, 56, 114);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
  }

  .modal-actions button:hover {
    background-color: rgb(212, 46, 100);
  }

  .delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #ff4d4d;
}

.delete-btn:hover {
  color: #ff1a1a;
}
</style>