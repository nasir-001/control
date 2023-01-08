<template>
  <q-page padding>
    <div class="row q-pb-xl justify-center q-gutter-sm-md">
      <!-- Title -->
      <div class="col-12 col-sm-8 col-lg-7 q-mx-xl-xl text-primary">
        <back-btn />
        <div class="row">
          <div class="col-12 col-sm-6 text-h5 q-pb-md q-pl-sm lt-sm">
            Add New User
          </div>
          <div class="col-12 col-sm-6 text-h4 q-pb-sm q-pl-sm gt-xs">
            Add New User
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-8 col-lg-7 q-mx-xl-xl">
        <div class="q-gutter-y-md q-gutter-sm-md q-pb-lg">
          <q-input
            outlined
            type="text"
            label="First Name"
            hide-bottom-space
            v-model="newUserPayload.firstname"
            :rules="[val => !!val || 'Field is required']"
          />
          <q-input
            outlined
            type="text"
            label="Last Name"
            hide-bottom-space
            v-model="newUserPayload.lastname"
            :rules="[val => !!val || 'Field is required']"
          />
          <q-input
            outlined
            type="text"
            bottom-slots
            hide-bottom-space
            label="Middle Name (Optional)"
            v-model="newUserPayload.middlename"
          />
          <q-input
            outlined
            type="email"
            label="Email"
            hide-bottom-space
            :error="emailError.status"
            @focus="emailError.status = false"
            v-model="newUserPayload.email"
            :error-message="emailError.message"
            :rules="[
              val => !!val || 'Field is required',
              val => validateEmail(val)
            ]"
          />
          <q-input
            outlined
            lazy-rules
            label="Password"
            hide-bottom-space
            v-model="newUserPayload.password"
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
          <div :class="[$q.screen.lt.sm ? 'full-width' : 'float-right']">
            <q-btn
              color="primary"
              padding="sm xl"
              @click="createUser"
              label="Add new user"
              :loading="addBtnIsLoading"
              :class="[$q.screen.lt.sm ? 'full-width q-ml-sm' : '']"
              :disabled="emptyRequiredField || addBtnIsLoading"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { getMetaData, validateEmail } from 'boot/utils'
export default defineComponent({
  name: 'NewUser',
  mixins: [getMetaData('New User')],
  data () {
    return {
      isPwd: true,
      addBtnIsLoading: false,
      emailError: {
        status: false,
        message: ''
      },
      newUserPayload: {
        email: '',
        password: '',
        lastname: '',
        firstname: '',
        middlename: ''
      }
    }
  },
  computed: {
    emptyRequiredField () {
      return (
        !this.newUserPayload.firstname ||
        !this.newUserPayload.lastname ||
        !this.newUserPayload.email ||
        !this.newUserPayload.password
      )
    }
  },
  methods: {
    validateEmail (value) {
      return validateEmail(value)
    },
    getAuthToken () {
      return this.$q.localStorage.getItem('authToken')
    },
    createUser () {
      const self = this
      self.addBtnIsLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.post('/users', self.newUserPayload)
        .then(function (response) {
          self.addBtnIsLoading = false
          self.$q.notify({
            icon: 'done',
            type: 'positive',
            timeout: 7000,
            position: 'top',
            message: 'User added successfully'
          })
          self.$router.push({ name: 'user-detail', params: { uuid: response.data.uuid } })
        })
        .catch(function (error) {
          const errorObj = error.response
          if (errorObj.status >= 400) {
            if (errorObj.data.detail.indexOf('mail') >= 0) {
              self.emailError.status = true
              self.emailError.message = errorObj.data.detail
              self.addBtnIsLoading = false
            } else {
              self.$q.notify({
                timeout: 15000,
                position: 'top',
                type: 'negative',
                message: error.response.data.detail,
                actions: [{ icon: 'close', color: 'red-3' }]
              })
            }
          }
        })
    }
  }
})
</script>