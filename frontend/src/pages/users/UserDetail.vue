<template>
  <q-page padding>
    <div class="row q-pb-xl justify-center q-gutter-sm-md">
      <!-- Title -->
      <div class="col-12 col-sm-10 col-lg-7 q-mx-xl-xl text-primary">
        <back-btn />
        <div class="row">
          <div class="col-12 col-sm-6 text-h5 q-pb-md q-pl-sm lt-sm">
            {{ userObj.firstname }}
          </div>
          <div class="col-12 col-sm-6 text-h4 q-pb-md q-pl-sm gt-xs">
            {{ userObj.firstname }}
          </div>
          <div class="col-12 col-sm-6 q-pb-md q-gutter-x-sm">
            <q-btn
              no-caps
              color="primary"
              label="Edit User Info"
              @click="userEdit = true"
              :disabled="tableIsLoading"
              :class="[$q.screen.lt.sm ? 'q-mt-sm' : 'float-right']"
            />
            <q-btn
              no-caps
              outline
              color="primary"
              label="Add Group to User"
              @click="groupEdit = true"
              :disabled="tableIsLoading"
              :class="[$q.screen.lt.sm ? 'q-mt-sm' : 'float-right']"
            />
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <not-found v-if="notFound" back />

      <!-- Found -->
      <div v-else class="col-12 col-sm-10 col-lg-7 q-mx-xl-xl">
        <!-- Loading Skeleton -->
        <div v-if="tableIsLoading" class="row justify-center q-pb-xl">
          <div class="col-12 q-gutter-sm q-pt-lg">
            <q-skeleton animation="pulse" type="QInput" />
            <q-skeleton animation="pulse" type="QInput" />
            <q-skeleton animation="pulse" type="QInput" />
            <q-skeleton animation="pulse" type="QInput" />
          </div>
        </div>

        <!-- User Detail -->
        <div v-else class="row">
          <div class="col-12 q-gutter-y-sm">
            <q-input
              readonly
              outlined
              type="text"
              label="First Name"
              :model-value="userObj.firstname"
            />
            <q-input
              readonly
              outlined
              type="text"
              label="Last Name"
              :model-value="userObj.lastname"
            />
            <q-input
              readonly
              outlined
              type="text"
              label="Middle Name"
              :model-value="userObj.middlename"
            />
            <q-input
              readonly
              outlined
              type="text"
              label="Email"
              :model-value="userObj.email"
            />
            <q-card flat bordered class="q-pa-sm border-color">
              <div class="text-grey-8 text-caption">Status</div>
              <q-card-section class="q-pa-none">
                <q-chip
                  text-color="white"
                  :color="userObj.is_active ? 'positive' : 'negative'"
                  class="q-my-none q-ml-xs q-mr-none"
                >
                  {{ userObj.is_active ? 'Active' : 'Inactive' }}
                </q-chip>
              </q-card-section>
            </q-card>
            <q-card flat bordered class="q-pa-sm border-color">
              <div class="text-grey-8 text-caption">User Groups</div>
              <q-card-section class="q-pa-none">
                <q-chip
                  removable
                  :key="group.name"
                  v-for="group in userObj.groups"
                  @remove="makeRemovePayload(group.name)"
                  class="q-my-none q-ml-xs q-mr-none"
                >
                  {{ group.name }}
                </q-chip>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit user modal/dialog -->
    <q-dialog persistent :maximized="$q.screen.lt.sm" v-model="userEdit">
      <q-card class="my-card">
        <q-card-section class="row items-center q-py-sm">
          <div class="text-h5">Edit User Info</div>
          <q-space />
          <q-btn v-close-popup outline size="sm" color="primary" label="Close" />
        </q-card-section>
        <q-separator />

        <q-card-section>
          <form @submit.prevent.stop="editUser" class="q-gutter-y-sm">
            <q-input
              outlined
              type="text"
              hide-bottom-space
              label="First Name"
              v-model="userEditPayload.firstname"
              :rules="[val => !!val || 'Field is required']"
            />
            <q-input
              outlined
              type="text"
              label="Last Name"
              hide-bottom-space
              v-model="userEditPayload.lastname"
              :rules="[val => !!val || 'Field is required']"
            />
            <q-input
              outlined
              type="text"
              bottom-slots
              hide-bottom-space
              label="Middle Name (Optional)"
              v-model="userEditPayload.middlename"
            />
            <q-input
              outlined
              type="email"
              label="Email"
              hide-bottom-space
              :error="emailError.status"
              @input="emailError.status = false"
              v-model="userEditPayload.email"
              :error-message="emailError.message"
              :rules="[
                val => !!val || 'Field is required',
                val => validateEmail(val)
              ]"
            />
            <q-select
              outlined
              label="Status"
              hide-bottom-space
              v-model="userEditPayload.is_active"
              :options="[
                { label: 'Active', value: true },
                { label: 'Inactive', value: false }
              ]"
            />
            <q-card-actions class="q-px-none q-gutter-y-sm">
              <q-btn
                no-caps
                unelevated
                type="submit"
                class="full-width"
                color="primary"
                label="Submit"
                :disabled="editBtnIsLoading"
                :loading="editBtnIsLoading"
              />
              <q-btn
                no-caps
                outline
                label="Cancel"
                class="full-width"
                color="grey-8"
                v-close-popup
              />
            </q-card-actions>
          </form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add user group modal/dialog -->
    <q-dialog
      persistent
      v-model="groupEdit"
      :maximized="$q.screen.lt.sm"
      @hide="userOwnGroup = { label: '', value: '' }"
    >
      <q-card class="my-card">
        <q-card-section class="row items-center q-py-sm">
          <div class="text-h5">Change User Group</div>
          <q-space />
          <q-btn v-close-popup outline size="sm" color="primary" label="Close" />
        </q-card-section>
        <q-separator />

        <q-card-section>
          <form @submit.prevent.stop="changeUserGroup" class="q-gutter-y-sm">
            <q-select
              outlined
              hide-bottom-space
              label="User Group"
              v-model="userOwnGroup"
              :options="groupOptions"
              :rules="[val => !!val || 'Field is required']"
            />
            <q-card-actions class="q-px-none q-gutter-y-sm">
              <q-btn
                no-caps
                unelevated
                type="submit"
                color="primary"
                class="full-width"
                label="Submit"
                :disabled="editBtnIsLoading"
                :loading="editBtnIsLoading"
              />
              <q-btn
                no-caps
                outline
                label="Cancel"
                class="full-width"
                color="grey-8"
                v-close-popup
              />
            </q-card-actions>
          </form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Remove group from user modal/dialog -->
    <q-dialog persistent v-model="removeDialog" @hide="removePayload = ''">
      <q-card class="q-pa-sm text-body1">
        <q-card-section class="q-px-sm">
          Are you sure you want to remove <span class="text-weight-bold">{{ removePayload }}</span> from this user?
        </q-card-section>
        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn
            outline
            no-caps
            label="Cancel"
            color="grey-8"
            padding="xs lg"
            v-close-popup
          />
          <q-btn
            no-caps
            unelevated
            label="Remove"
            padding="xs lg"
            color="negative"
            @click="removeGroup"
            :loading="removeBtnLoading"
            :disabled="removeBtnLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { getMetaData, validateEmail } from 'boot/utils'
export default defineComponent({
  name: 'UserDetail',
  mixins: [getMetaData('User Detail')],
  data () {
    return {
      userObj: {},
      userGroups: [],
      userEdit: false,
      notFound: false,
      groupEdit: false,
      groupOptions: [],
      removePayload: '',
      removeDialog: false,
      tableIsLoading: false,
      removeBtnLoading: false,
      editBtnIsLoading: false,
      emailError: {
        status: false,
        message: ''
      },
      userEditPayload: {
        middlename: '',
        firstname: '',
        lastname: '',
        status: null,
        email: '',
      },
      userOwnGroup: {
        label: '',
        value: ''
      }
    }
  },
  methods: {
    validateEmail (value) {
      return validateEmail(value)
    },
    getAuthToken () {
      return this.$q.localStorage.getItem('authToken')
    },
    getUserDetail () {
      const self = this
      if (self.userObj.firstname === undefined) {
        self.tableIsLoading = true
      }
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.get(`/users/${self.$route.params.uuid}`)
        .then(function (response) {
          self.userObj = response.data
          const editPayload =response.data
          for (const key of Object.keys(editPayload)) {
            if (Object.keys(self.userEditPayload).indexOf(key) >= 0) {
              self.userEditPayload[key] = editPayload[key]
            }
            self.userEditPayload.is_active = editPayload.is_active ?
              { label: 'Active', value: true } :
              { label: 'Inactive', value: false }
          }
          self.tableIsLoading = false
        })
        .catch(function (error) {
          if (error.response.status >= 400) {
            self.notFound = true
            self.tableIsLoading = false
          }
        })
    },
    getGroupList () {
      const self = this
      self.tableIsLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.get('/groups')
        .then(function (response) {
          const options = []
          for (let i = 0; i < response.data.length; i++) {
            options.push({
              label: response.data[i].name,
              value: response.data[i].uuid
            })
          }
          self.groupOptions = options
          self.tableIsLoading = false
        })
    },
    editUser () {
      const self = this
      self.editBtnIsLoading = true
      const payload = {...self.userEditPayload}
      payload.is_active = self.userEditPayload.is_active.value
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.put(`/users/${self.userObj.uuid}`, payload)
        .then(function () {
          self.getUserDetail()
          self.editBtnIsLoading = false
          self.userEdit = false
          self.$q.notify({
            timeout: 7000,
            position: 'top',
            type: 'positive',
            message: 'User modified successfully',
            actions: [{ icon: 'close', color: 'green-2' }]
          })
        })
        .catch(function (error) {
          const errorObj = error.response
          if (errorObj.status === 404) {
            if (errorObj.data.detail.indexOf('not found') >= 0) {
              self.emailError.status = true
              self.emailError.message = 'email already in use!'
              self.editBtnIsLoading = false
            }
          }
        })
    },
    changeUserGroup () {
      const self = this
      self.editBtnIsLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.post(`/users/${self.userObj.uuid}/groups`, { groups: [self.userOwnGroup.label] })
        .then(function () {
          self.getUserDetail()
          self.editBtnIsLoading = false
          self.groupEdit = false
          self.$q.notify({
            timeout: 7000,
            position: 'top',
            type: 'positive',
            message: 'User group added successfully',
            actions: [{ icon: 'close', color: 'green-2' }]
          })
        })
        .catch(function (error) {
          self.editBtnIsLoading = false
          if (error.response.status >= 400) {
            self.$q.notify({
              timeout: 15000,
              position: 'top',
              type: 'negative',
              message: error.response.data.detail,
              actions: [{ icon: 'close', color: 'red-3' }]
            })
          }
        })
    },
    makeRemovePayload (payload) {
      this.removePayload = payload
      this.removeDialog = true
    },
    removeGroup () {
      const self = this
      self.removeBtnLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.delete(`/users/${self.userObj.uuid}/groups`, { data: { groups: [self.removePayload] } })
        .then(function () {
          self.getUserDetail()
          self.removeBtnLoading = false
          self.userOwnGroup = {
            label: '',
            value: ''
          }
          self.removeDialog = false
          self.$q.notify({
            timeout: 7000,
            position: 'top',
            type: 'positive',
            message: 'Group removed successfully!',
            actions: [{ icon: 'close', color: 'green-2' }]
          })
        })
        .catch(function (error) {
          console.log(error)
          self.removeBtnLoading = false
          if (error.response.status >= 400) {
            self.$q.notify({
              timeout: 15000,
              position: 'top',
              type: 'negative',
              message: error.response.data.detail,
              actions: [{ icon: 'close', color: 'red-3' }]
            })
          }
        })
    }
  },
  created () {
    this.getUserDetail()
    this.getGroupList()
  }
})
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 450px;
}
.border-color {
  border-style: dashed;
  border-color: #616161 !important;
}
</style>