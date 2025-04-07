<script setup>
    defineProps({
    trip: {
        type: Object,
        required: true
    }
    })
</script>

<template>
  <div class="trip-card" @click="$router.push(`/trip/${trip.id}`)">
    <h2>{{ trip.title }}</h2>
    <p>{{ trip.posts.length }} post<span v-if="trip.posts.length !== 1">s</span></p>
  </div>
</template>

<!-- <style scoped>
    .trip-card {
    width: 250px;
    padding: 20px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    text-align: center;
    }

    .trip-card:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(230, 56, 114, 0.4);
    }

    h2 {
    font-size: 20px;
    color: rgb(230, 56, 114);
    margin-bottom: 10px;
    }

    p {
    font-size: 14px;
    color: #666;
    }
</style> -->

<style scoped>
.trip-card {
  /* remove fixed width so it responds to grid */
  width: 100%;
  max-width: 250px; /* optional limit to avoid giant cards */
  padding: 20px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  text-align: center;
  margin: auto; /* ensures centering if needed */
}

.trip-card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(230, 56, 114, 0.4);
}

h2 {
  font-size: 20px;
  color: rgb(230, 56, 114);
  margin-bottom: 10px;
}

p {
  font-size: 14px;
  color: #666;
}
</style>

