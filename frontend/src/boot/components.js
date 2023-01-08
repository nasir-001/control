import BackButton from 'components/BackButton.vue'
import NotFound404 from 'components/NotFound404.vue'

// "async" is optional
export default async ({ app }) => {
  app.component('back-btn', BackButton)
  app.component('not-found', NotFound404)
}