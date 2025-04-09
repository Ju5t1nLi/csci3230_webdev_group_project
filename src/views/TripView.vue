<script setup>
import { ref, watch } from 'vue'
import { useRoute, RouterView} from 'vue-router'
import { trips } from '../stores/trip'
import PostCard from '../components/PostCard.vue'
import AddPostForm from '../components/AddPostForm.vue'

const route = useRoute()
const trip = ref(null)
const tripId = parseInt(route.params.id)


const updateTrip = async () => {
  const tripId = parseInt(route.params.id)
  const selectedTrip = trips.value.find((t) => t.id === tripId)

  if (!selectedTrip) {
    trip.value = null
    return
  }

  try {
    const res = await fetch(`http://localhost:3001/trips/${tripId}/posts`)
    const posts = await res.json()
    trip.value = { ...selectedTrip, posts }
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    trip.value = { ...selectedTrip, posts: [] }
  }
}

watch(() => route.params.id, updateTrip, { immediate: true })

const deletePost = async (postId) => {
  const tripId = parseInt(route.params.id);
  console.log(`Deleting post with ID: ${postId} from trip with ID: ${tripId}`);

  try {
    const response = await fetch(`http://localhost:3001/trips/${tripId}/posts/${postId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      trip.value.posts = trip.value.posts.filter((post) => post.id !== postId);
    } else {
      const errorText = await response.text();
      console.error('Error deleting post:', errorText);
    }
  } catch (error) {
    console.error('Error deleting post:', error);
  }
};

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
          @delete="deletePost"
        />
      </div>

    <button class="add-post-btn">
        <RouterLink :to="{path: '/globe', query: {tripId: tripId}}">Add New Post</RouterLink>
    </button>
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