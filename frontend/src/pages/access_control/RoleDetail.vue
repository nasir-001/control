<template>
  <q-page padding>
    <div class="row q-pb-xl justify-center q-gutter-sm-md">
      <!-- Title -->
      <div class="col-12 col-sm-10 col-lg-7 q-mx-xl-xl text-primary" v-if="!notFound">
        <back-btn />
        <div class="row q-gutter-y-sm q-pb-md">
          <div class="col-12 col-sm-6 text-h4">{{ roleObj.name }}</div>
          <div class="col-12 col-sm-6">
            <q-btn
              no-caps
              color="primary"
              @click="addPerm = true"
              :disabled="tableIsLoading"
              label="Add Permission to Role"
              :class="[$q.screen.lt.sm ? 'full-width' : 'float-right']"
            />
          </div>
        </div>
      </div>
      <!-- Permiions Table -->
      <div class="col-12 col-sm-10 col-lg-7">
        <not-found back v-if="notFound" />
        <q-table
          v-else 
          row-key="name"
          class="col-12"
          :columns="columns"
          :loading="tableIsLoading"
          :rows="roleObj.permissions"
          :rows-per-page-options="[10, 25, 50, 0]"
          table-header-class="bg-green-1 text-green-10"
        >
          <template v-slot:body-cell-remove="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                class="q-mr-md"
                color="negative"
                @click="removePermFromRole(props.row.name)"
                icon="delete"
              >
                <q-tooltip :delay="1000" anchor="bottom middle" self="top middle" :offset="[10, 10]">
                  Remove permission
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </div>
    </div>

    <!-- Add permission modal/dialog -->
    <q-dialog persistent :maximized="$q.screen.lt.sm" v-model="addPerm" @hide="addPermPayload = ''">
      <q-card class="my-card">
        <q-card-section class="row items-center q-py-sm">
          <div class="text-h5">Add Permission</div>
          <q-space />
          <q-btn v-close-popup outline size="sm" color="primary" label="Close" />
        </q-card-section>
        <q-separator />

        <q-card-section>
          <form v-on:submit.prevent.stop="addPermToRole" class="q-gutter-md">
            <q-select
              ref="name"
              outlined
              use-input
              type="text"
              bottom-slots
              hide-bottom-space
              @filter="filterFn"
              :options="options"
              label="Permission Name"
              :error="permError.status"
              :error-message="permError.message"
              v-model="addPermPayload"
              :rules="[ val => !!val || 'This field is required.' ]"
              @input="permError.status = false"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-card-actions class="q-gutter-y-sm q-px-none">
              <q-btn
                no-caps
                unelevated
                type="submit"
                color="primary"
                class="full-width"
                label="Add Permission"
                :disabled="addPermBtnLoading || !addPermPayload"
                :loading="addPermBtnLoading"
              />
              <q-btn
                outline
                no-caps
                label="Cancel"
                color="grey-8"
                class="full-width"
                v-close-popup
              />
            </q-card-actions>
          </form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { getMetaData } from 'boot/utils'
const tableCols = [
  { name: 'permission', label: 'ROLE PERMISSIONS', field: 'name', align: 'left', sortable: true },
  { name: 'remove', label: '', align: 'right' }
]
export default defineComponent({
  name: 'RoleDetail',
  mixins: [getMetaData('User Role')],
  data () {
    return {
      options: [],
      roleObj: {},
      permsList: [],
      addPerm: false,
      notFound: false,
      addPermPayload: '',
      columns: tableCols,
      tableIsLoading: false,
      addPermBtnLoading: false,
      permError: {
        status: false,
        message: ''
      }
    }
  },
  computed: {
    allPermissions () {
      const rolePermissions = this.roleObj.permissions.map((perm) => {
        return perm.name
      })
      const perms = this.permsList.map((perm) => {
        return perm.name
      })
      return perms.filter(perm => rolePermissions.indexOf(perm) === -1)
    }
  },
  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.allPermissions
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.options = this.allPermissions.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    getAuthToken () {
      return this.$q.localStorage.getItem('authToken')
    },
    getAllPermissions () {
      const self = this
      if (!self.roleObj.name) {
        self.tableIsLoading = true
      }
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.get('/permissions')
        .then(function (response) {
          self.permsList = response.data
        })
    },
    getRoleDetail () {
      const self = this
      if (!self.roleObj) {
        self.tableIsLoading = true
      }
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.get(`/roles/${self.$route.params.roleName}`)
        .then(function (response) {
          self.roleObj = response.data
          self.tableIsLoading = false
        })
        .catch(function (error) {
          if (error.response.status === 404) {
            self.tableIsLoading = false
            self.notFound = true
          }
        })
    },
    addPermToRole () {
      const self = this
      self.addPermBtnLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.put(
        `/roles/${self.roleObj.name}`,
        { permissions: [self.addPermPayload] }
      )
        .then(function (response) {
          self.$q.notify({
            icon: 'done',
            type: 'positive',
            timeout: 5000,
            position: 'top',
            message: 'Permission added successfully',
          })
          self.addPermBtnLoading = false
          self.getRoleDetail()
          self.getAllPermissions()
          self.addPerm = false
          self.addPermPayload = ''
        })
    },
    removePermFromRole (perm) {
      const self = this
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.delete(
        `/roles/${self.roleObj.name}/permissions`,
        { data: { permissions: [perm] } }
      )
        .then(function (response) {
          self.$q.notify({
            icon: 'done',
            type: 'positive',
            timeout: 5000,
            position: 'top',
            message: 'Permission removed successfully'
          })
          self.getRoleDetail()
          self.getAllPermissions()
        })
        .catch(function (error) {
          if (error.response.status === 404) {
            self.$q.notify({
              icon: 'warning',
              type: 'negative',
              timeout: 5000,
              position: 'top',
              message: error.response.data.detail
            })
          }
        })
    }
  },
  created () {
    this.getRoleDetail()
    this.getAllPermissions()
  }
})
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 450px;
}
</style>