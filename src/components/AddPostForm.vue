<!-- <script setup>
import { ref, defineProps, watch, defineEmits } from 'vue'

const props = defineProps({
  post: Object
})

const emit = defineEmits(['submit', 'close'])

const title = ref('')
const location = ref('')
const time = ref('')
const content = ref('')

watch(() => props.post, (post) => {
  if (post) {
    title.value = post.title
    location.value = post.location
    time.value = post.time
    content.value = post.content
  }
}, { immediate: true })

const submitForm = () => {
  emit('submit', {
    id: props.post?.id || Date.now(),
    title: title.value,
    location: location.value,
    time: time.value,
    content: content.value,
  })

  title.value = ''
  location.value = ''
  time.value = ''
  content.value = ''

  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <form class="modal-content" @submit.prevent="submitForm">
      <h2>Add New Post</h2>
      <input v-model="title" type="text" placeholder="Title" required />
      <input v-model="location" type="text" placeholder="Location" required />
      <input v-model="time" type="date" required />
      <textarea v-model="content" placeholder="Notes..." required></textarea>
      <div class="actions">
        <button type="button" @click="$emit('close')">Cancel</button>
        <button type="submit">Add</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
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
    gap: 0.75rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  }

  input,
  textarea {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .actions {
    display: flex;
    justify-content: space-between;
  }
</style> -->


<script setup>
import { ref, defineProps, watch, defineEmits } from 'vue'

const props = defineProps({
  post: Object
})

const emit = defineEmits(['submit', 'close'])

const time = ref('')
const content = ref('')
const latitude = ref('')
const longitude = ref('')
const date = ref('')

watch(() => props.post, (post) => {
  if (post) {
    time.value = post.time
    content.value = post.content
    latitude.value = post.latitude || ''  // Set initial value for latitude
    longitude.value = post.longitude || ''  // Set initial value for longitude
    date.value = post.date || ''  // Set initial value for date
  }
}, { immediate: true })

const submitForm = () => {
  emit('submit', {
    id: props.post?.id || Date.now(),
    time: time.value,
    content: content.value,
    latitude: latitude.value,
    longitude: longitude.value,
    date: date.value, 
  })

  time.value = ''
  content.value = ''
  latitude.value = ''
  longitude.value = ''
  date.value = ''  // Clear the form fields

  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <form class="modal-content" @submit.prevent="submitForm">
      <h2>Add New Post</h2>
      <input v-model="time" type="date" required />
      <textarea v-model="content" placeholder="Notes..." required></textarea>
      <input v-model="latitude" type="number" step="any" placeholder="Latitude" required />
      <input v-model="longitude" type="number" step="any" placeholder="Longitude" required />

      <div class="actions">
        <button type="button" @click="$emit('close')">Cancel</button>
        <button type="submit">Add</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
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
    gap: 0.75rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  }

  input,
  textarea {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .actions {
    display: flex;
    justify-content: space-between;
  }
</style>
