<template>
  <q-page padding>
    <div class="row q-pb-xl justify-center q-gutter-sm-md">
      <!-- Title -->
      <div class="col-12 col-sm-10 col-lg-7 q-mx-xl-xl text-primary">
        <back-btn />
        <div class="row q-gutter-y-sm q-pb-md">
          <div class="col-12 col-sm-6 text-h4">User Permissions</div>
          <div class="col-12 col-sm-6">
            <q-btn
              no-caps
              color="primary"
              :class="[$q.screen.lt.sm ? 'full-width' : 'float-right']"
              label="Add New Permission"
              :disabled="tableIsLoading"
              @click="newPerm = true"
            />
          </div>
        </div>
      </div>

      <!-- Permissions Table -->
      <div class="col-12 col-sm-10 col-lg-7">
        <q-table
          row-key="name"
          class="col-12"
          :columns="columns"
          :rows="permissionsList"
          :loading="tableIsLoading"
          :rows-per-page-options="[10, 25, 50, 0]"
          table-header-class="bg-green-1 text-green-10"
        >
          <template v-slot:body-cell-delete="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                icon="delete"
                class="q-mr-md"
                color="negative"
                @click="makeDeletePayload(props.row.name)"
              >
                <q-tooltip :delay="1000" anchor="bottom middle" self="top middle" :offset="[10, 10]">
                  Delete permission
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

    <!-- New permission modal/dialog -->
    <q-dialog
      persistent
      v-model="newPerm"
      :maximized="$q.screen.lt.sm"
      @hide="newPermission = { name: '', description: '' }"
    >
      <q-card class="my-card">
        <q-card-section class="row items-center q-py-sm">
          <div class="text-h5">New Permission</div>
          <q-space />
          <q-btn v-close-popup outline size="sm" color="primary" label="Close" />
        </q-card-section>
        <q-separator />

        <q-card-section>
          <form v-on:submit.prevent.stop="addNewPermission" class="q-gutter-md">
            <q-input
              outlined
              ref="name"
              type="text"
              label="Name"
              bottom-slots
              hide-bottom-space
              :error="permError.status"
              :error-message="permError.message"
              @focus="permError.status = false"
              v-model="newPermission.name"
              :rules="[ val => !!val || 'This field is required.' ]"
            />
            <q-input
              autogrow
              outlined
              hide-bottom-space
              label="Description"
              v-model="newPermission.description"
            />
            <q-card-actions class="q-gutter-y-sm q-px-none">
              <q-btn
                no-caps
                unelevated
                type="submit"
                label="Submit"
                color="primary"
                class="full-width"
                :loading="newPermBtnLoading"
                :disabled="newPermBtnLoading || !newPermission"
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

    <!-- Delete permission modal/dialog -->
    <q-dialog persistent v-model="confirmPermDelete">
      <q-card class="q-pa-sm text-body1">
        <q-card-section class="q-px-sm">
          Are you sure you want to delete <span class="text-weight-bold">{{ deletePermPayload }}</span>? You will not be able to make changes after deleting it.
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
            color="negative"
            padding="xs lg"
            label="Delete Permission"
            @click="deletePermission"
            :loading="deleteBtnIsLoading"
            :disabled="deleteBtnIsLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { getMetaData } from 'boot/utils'
const tableCols = [
  { name: 'permission', label: 'PERMISSIONS', field: 'name', align: 'left', sortable: true },
  { name: 'delete', label: '', align: 'right' }
]
export default defineComponent({
  name: 'Permissions',
  mixins: [getMetaData('User Permissions')],
  data () {
    return {
      newPerm: false,
      newPermission: {
        name: '',
        description: ''
      },
      columns: tableCols,
      deletePermPayload: '',
      tableIsLoading: false,
      newPermBtnLoading: false,
      confirmPermDelete: false,
      deleteBtnIsLoading: false,
      permError: {
        status: false,
        message: ''
      },
      permissionsList: []
    }
  },
  methods: {
    getAuthToken () {
      return this.$q.localStorage.getItem('authToken')
    },
    getPermissionsList () {
      const self = this
      self.tableIsLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.get('/permissions')
        .then(function (response) {
          self.permissionsList = response.data
          self.tableIsLoading = false
        })
    },
    addNewPermission () {
      const self = this
      self.newPermBtnLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.post('/permissions', self.newPermission)
        .then(function (response) {
          self.newPermission = ''
          self.newPermBtnLoading = false
          self.getPermissionsList()
          self.newPerm = false
          self.$q.notify({
            icon: 'done',
            type: 'positive',
            timeout: 5000,
            position: 'top',
            message: 'Permission added successfully'
          })
        })
        .catch(function (error) {
          self.permError.message = error.response.data.detail
          self.newPermBtnLoading = false
          self.permError.status = true
        })
    },
    makeDeletePayload (payload) {
      this.deletePermPayload = payload
      this.confirmPermDelete = true
    },
    deletePermission () {
      const self = this
      self.deleteBtnIsLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.delete(`/permissions/${self.deletePermPayload}`)
        .then(function (response) {
          self.deleteBtnIsLoading = false
          self.getPermissionsList()
          self.confirmPermDelete = false
          self.$q.notify({
            icon: 'done',
            type: 'positive',
            timeout: 7000,
            position: 'top',
            message: 'Permission deleted successfully'
          })
        })
        .catch(function (error) {
          if (error.response.status === 403) {
            self.confirmPermDelete = false
            self.$q.notify({
              icon: 'done',
              type: 'negative',
              timeout: 7000,
              position: 'top',
              message: error.response.data.detail
            })
            self.deleteRolePayload = ''
            self.deleteBtnIsLoading = false
          }
        })
    }
  },
  created () {
    this.getPermissionsList()
  }
})
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 450px;
}
</style>