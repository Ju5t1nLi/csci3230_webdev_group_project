<script setup>
defineProps({
  cardProp: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="post-card">
    <h2>{{ cardProp.title }}</h2>
    <h6>{{ cardProp.location }} {{ cardProp.time }}</h6>
    <span>{{ cardProp.content }}</span>
  </div>
</template>

<style scoped>
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

/* .post-card {
  padding: 5%;
  width: 250px;
  cursor: pointer;
  border: 1px solid #39495c;
  margin-bottom: 18px;
  background-color: white;
} */

.post-card {
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
