<script setup>
defineProps({
  cardProp: {
    type: Object,
    required: true,
  },
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="post-card">
    <div class="actions">
      <button @click="$emit('delete', cardProp.id)">❌</button>
    </div>
    
    <h2>{{ cardProp.title }}</h2>
    <h6>
      {{ cardProp.location }}
      <br />
      <span class="date">{{ formatDate(cardProp.blog_date) }}</span>
    </h6>
    <span>{{ cardProp.content }}</span>
  </div>
</template>

<style scoped>
.actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

button {
  padding: 6px;
  font-size: 18px;
  background: rgba(230, 56, 114, 0.8);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: rgba(200, 46, 90, 0.8);
}

span {
  font-size: 15px;
  text-align: center;
  margin: 5%;
}

h2 {
  font-size: 20px;
  color: rgb(230, 56, 114);
  margin-bottom: 0%;
}
h6 {
  margin-top: 0%;
}

.post-card {
  position: relative;
  width: 350px;
  padding: 20px;
  border: 1px solid #39495c;
  background-color: white;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  box-sizing: border-box;
}


.post-card:hover {
  transform: scale(1.01);
  box-shadow: 0 3px 12px 0 rgba(230, 56, 114, 0.594);
}
</style>
