<template>
  <div class="q-pa-sm q-pa-sm-md row justify-center">
    <div class="col-12 col-sm-7 col-md-4">
      <q-card flat bordered class="q-mt-xl q-pa-sm q-pb-lg w500">
        <form v-on:submit.prevent="loginUser">
          <q-card-section class="text-center">
            <!-- <div class="row text-h5 text-bold items-end justify-center text-primary">
              <q-icon name="mdi-script-text-outline" color="primary" size="lg" />Kloud97
            </div> -->
            <div class="row text-body1 p-pt-sm justify-center">
              FastAPI
            </div>
          </q-card-section>
          <q-card-section class="q-gutter-y-md">
            <q-input
              outlined
              auto-focus
              lazy-rules
              type="text"
              v-model="email"
              label="Username"
              hide-bottom-space
              :rules="[
                val => !!val || 'Field is required'
              ]"
            />
            <q-input
              outlined
              lazy-rules
              label="Password"
              hide-bottom-space
              v-model="password"
              :type="isPwd ? 'password' : 'text'"
              :rules="[val => !!val || 'Field is required']"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </q-card-section>
          <q-card-section>
            <q-btn
              label="Login"
              type="submit"
              color="primary"
              class="full-width"
              :loading="loginBtnLoading"
              :disabled="loginBtnLoading || !email || !password"
            />
          </q-card-section>
        </form>
      </q-card>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { getMetaData, hasPermission } from 'boot/utils'
export default defineComponent({
  name: 'Login',
  mixins: [getMetaData('Login')],
  data () {
    return {
      email: '',
      isPwd: true,
      password: '',
      loginBtnLoading: false
    }
  },
  methods: {
    triggerNotification (type, message) {
      this.$q.notify({
        type: type,
        message: message,
        position: 'top',
        timeout: 5000,
        actions: [{ icon: 'close', color: (type === 'positive') ? 'green-1' : 'red-1' }]
      })
    },
    loginUser () {
      const self = this
      self.loginBtnLoading = true
      self.$api.post('/auth/token', { email: self.email, password: self.password })
        .then(function (response) {
          if (response.status === 200) {
            window.localStorage.setItem('authToken', response.data.access_token)
            window.localStorage.setItem('permissionsList', response.data.permissions)

            if (hasPermission(response.data.access_token, 'can_create_group')) {
              self.$router.push({name: 'legacy-dashboard'})
            } 
            else if (hasPermission(response.data.access_token, 'can_view_ward_agent_dashboard')) {
              self.$router.push({name: 'ward-agent-dashboard'})
            }
            else if (hasPermission(response.data.access_token, 'can_view_agent_dashboard')) {
              self.$router.push({name: 'agent-dashboard'})
            }
          }
        })
        .catch(function (error) {
          self.loginBtnLoading = false
          if (!error.response) {
            self.$q.notify({
              type: 'negative',
              icon: 'mdi-network-strength-3-alert',
              timeout: 7000,
              position: 'top',
              message: 'Network error!',
              actions: [{ icon: 'close', color: 'red-1' }]
            })
          } else if (error.response.data.detail) {
            self.triggerNotification('negative', error.response.data.detail)
          }
        })
    }
  },
  created () {
    this.$api.get('/')
  }
})
</script>

<style scoped>
.w500 {
  max-width: 500px;
}
</style>