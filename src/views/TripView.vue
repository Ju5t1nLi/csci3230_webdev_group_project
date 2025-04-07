<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { trips } from '../stores/trip'
import PostCard from '../components/PostCard.vue'
import AddPostForm from '../components/AddPostForm.vue'

const route = useRoute()
const trip = ref(null)
const showForm = ref(false)
const postBeingEdited = ref(null)

const updateTrip = () => {
const tripId = parseInt(route.params.id)
trip.value = trips.value.find((t) => t.id === tripId)
}

watch(() => route.params.id, updateTrip, { immediate: true })

const addNewPost = (post) => {
  const existingIndex = trip.value.posts.findIndex(p => p.id === post.id)
  if (existingIndex !== -1) {
    trip.value.posts[existingIndex] = post
  } else {
    trip.value.posts.push(post)
  }
}

const editPost = (post) => {
  postBeingEdited.value = post
  showForm.value = true
}

const deletePost = (postId) => {
  trip.value.posts = trip.value.posts.filter(p => p.id !== postId)
}

const addPostButtonClick = () => {
  postBeingEdited.value = null
  showForm.value = true
}
</script>

<template>
    <div class="trip-view">
      <h1 v-if="trip">{{ trip.title }}</h1>
      <h1 v-else>Trip not found</h1>
  
      <div class="posts-container" v-if="trip">
        <PostCard
          v-for="post in trip.posts"
          :key="post.id"
          :cardProp="post"
          @edit="editPost"
          @delete="deletePost"
        />
      </div>
  
      <button
        v-if="trip"
        class="add-post-btn"
        @click="addPostButtonClick"
      >
        Add New Post
      </button>
  
      <AddPostForm
        v-if="showForm"
        :post="postBeingEdited"
        @submit="addNewPost"
        @close="showForm = false"
      />
    </div>
</template>


<style scoped>
  .trip-view {
    padding: 20px;
    text-align: center;
  }

  .posts-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    max-width: 1100px;
    margin: auto;
    padding: 20px;
    justify-items: center;
  }

  
  .add-post-btn {
    background-color: rgb(230, 56, 114);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    padding: 12px 24px;
    margin-top: 20px;
    cursor: pointer;
    transition: 0.2s;
  }
  
  .add-post-btn:hover {
    background-color: rgb(200, 46, 90);
    transform: scale(1.03);
  }
</style>