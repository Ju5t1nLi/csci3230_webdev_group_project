<script setup>
  import { ref, defineEmits } from 'vue'

  const emit = defineEmits(['submit', 'close'])

  const title = ref('')
  const location = ref('')
  const time = ref('')
  const content = ref('')

  const submitForm = () => {
    emit('submit', {
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
</style>
