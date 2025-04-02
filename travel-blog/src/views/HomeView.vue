<script setup>
// @ is an alias for src, making this an absolute path
import PostCard from '@/components/PostCard.vue'
import { ref } from 'vue'

const posts = ref([
  {
    id: 100,
    title: 'Post 1',
    content: 'the brown fox jumps over the lazy dog',
    location: 'London Ontario',
    time: '',
  },
  {
    id: 101,
    title: 'Post 2',
    content:
      'Words words words words words words words words words words words words words words  words words words words words',
    location: 'Oshawa',
    time: '',
  },
  {
    id: 102,
    title: 'Post 3',
    content: 'Post content goes here',
    location: 'Toronto',
    time: '',
  },
  {
    id: 103,
    title: 'Post 4',
    content: 'Post content goes here',
    location: 'Toronto',
    time: '',
  },
])

function createPost() {
  alert('Post Created')
  // create a next element in post
}
</script>

<template>
  <div>
    <h1>Travel Blog</h1>
    <h3>Your Adventures Live Here</h3>
    <button @click="createPost">+</button>
  </div>
  <br />
  <div class="posts">
    <!-- Iterate over each event Object. Bind to ID to help Vue track each item.
     Finally, add event Prop, which receives the event Object instance currently iterated -->
    <PostCard v-for="card in posts" :key="card.id" :cardProp="card" />
  </div>
</template>

<style scoped>
.posts {
  display: grid;
  grid-template-columns: auto auto auto;
  justify-content: space-evenly;
  text-align: center;
}

button {
  background-color: rgb(230, 56, 114);
  color: white;
  border: white;
  border-radius: 50%;
  font-size: 25px;
  font-weight: bold;
  display: block;
  height: 50px;
  width: 50px;
  margin: auto;
}

button:hover {
  transform: scale(1.01);
  box-shadow: 0 3px 12px 0 rgba(230, 56, 114, 0.594);
}
</style>
