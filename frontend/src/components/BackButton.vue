<template>
  <q-btn
    flat
    padding="sm"
    color="primary"
    class="q-mr-md"
    @click="goBack"
  >
    <q-icon
      left name="arrow_back"
      class="q-mr-xs"
    />
    <div>Back</div>
  </q-btn>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'BackButton',
  methods: {
    goBack () {
      return this.$router.back()
    }
  }
})
</script>