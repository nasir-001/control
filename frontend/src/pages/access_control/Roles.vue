<template>
  <q-page padding>
    <div class="row q-pb-xl justify-center q-gutter-sm-md">
      <!-- Title -->
      <div class="col-12 col-sm-10 col-lg-7 q-mx-xl-xl text-primary">
        <back-btn />
        <div class="row q-gutter-y-sm q-pb-md">
          <div class="col-12 col-sm-6 text-h4">User Roles</div>
          <div class="col-12 col-sm-6">
            <q-btn
              no-caps
              color="primary"
              label="Add New Role"
              @click="newRole = true"
              :disabled="tableIsLoading"
              :class="[$q.screen.lt.sm ? 'full-width' : 'float-right']"
            />
          </div>
        </div>
      </div>

      <!-- Roles Table -->
      <div class="col-12 col-sm-10 col-lg-7">
        <q-table
          row-key="name"
          class="col-12"
          :rows="rolesList"
          :columns="columns"
          :loading="tableIsLoading"
          :rows-per-page-options="[10, 25, 50, 0]"
          table-header-class="bg-green-1 text-green-10"
        >
          <template v-slot:body-cell-role="props">
            <q-td
              :props="props"
              @click="$router.push({
                name: 'role-detail',
                params: { roleName: props.row.name }
              })"
            >
              {{ props.row.name }}
            </q-td>
          </template>

          <template v-slot:body-cell-delete="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="delete"
                class="q-mr-md"
                color="negative"
                @click="makeDeletePayload(props.row.name)"
              />
            </q-td>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </div>
    </div>

    <!-- New role modal/dialog -->
    <q-dialog
      persistent
      v-model="newRole"
      :maximized="$q.screen.lt.sm"
      @hide="newRolePayload = { name: '', description: '' }"
    >
      <q-card class="my-card">
        <q-card-section class="row items-center q-py-sm">
          <div class="text-h5">New Role</div>
          <q-space />
          <q-btn v-close-popup outline size="sm" color="primary" label="Close" />
        </q-card-section>
        <q-separator />

        <q-card-section>
          <form v-on:submit.prevent.stop="addNewRole" class="q-gutter-md">
            <q-input
              ref="name"
              outlined
              type="text"
              label="Name"
              bottom-slots
              hide-bottom-space
              :error="newRoleError.status"
              :error-message="newRoleError.message"
              v-model="newRolePayload.name"
              :rules="[ val => !!val || 'This field is required.' ]"
              @focus="newRoleError.status = false"
            />
            <q-input
              autogrow
              outlined
              hide-bottom-space
              label="Description"
              v-model="newRolePayload.description"
            />
            <q-card-actions class="q-gutter-y-sm q-px-none">
              <q-btn
                no-caps
                type="submit"
                label="Add New Role"
                color="primary"
                class="full-width"
                :loading="newRoleBtnLoading"
                :disabled="newRoleBtnLoading || !newRolePayload"
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

    <!-- Delete role modal/dialog -->
    <q-dialog v-model="confirmRoleDelete" persistent>
      <q-card class="q-pa-sm text-body1">
        <q-card-section class="q-px-sm">
          Are you sure you want to delete <span class="text-weight-bold">{{ deleteRolePayload }}</span>? You will not be able to make changes after deleting it.
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
            label="Delete Role"
            @click="deleteRole"
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
  { name: 'role', label: 'ROLES', field: 'name', align: 'left', classes: 'cursor-pointer', sortable: true },
  { name: 'delete', label: '', align: 'right' }
]
export default defineComponent({
  name: 'Roles',
  mixins: [getMetaData('User Roles')],
  data () {
    return {
      newRole: false,
      newRolePayload: {
        name: '',
        description: ''
      },
      columns: tableCols,
      deleteRolePayload: '',
      tableIsLoading: false,
      newRoleBtnLoading: false,
      confirmRoleDelete: false,
      deleteBtnIsLoading: false,
      newRoleError: {
        status: false,
        message: ''
      },
      rolesList: []
    }
  },
  methods: {
    getAuthToken () {
      return this.$q.localStorage.getItem('authToken')
    },
    getRolesList () {
      const self = this
      if (self.rolesList.length === 0) {
        self.tableIsLoading = true
      }
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.get('/roles')
        .then(function (response) {
          self.rolesList = response.data
          self.tableIsLoading = false
        })
    },
    addNewRole () {
      const self = this
      self.newRoleBtnLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.post('/roles', self.newRolePayload)
        .then(function (response) {
          self.newRolePayload = ''
          self.newRoleBtnLoading = false
          self.newRole = false
          self.getRolesList()
          self.$q.notify({
            icon: 'done',
            type: 'positive',
            timeout: 5000,
            position: 'top',
            message: 'Role added successfully'
          })
        })
        .catch(function (error) {
          self.newRoleError.message = error.response.data.detail
          self.newRoleError.status = true
          self.newRoleBtnLoading = false
        })
    },
    makeDeletePayload (payload) {
      this.deleteRolePayload = payload
      this.confirmRoleDelete = true
    },
    deleteRole () {
      const self = this
      self.deleteBtnIsLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.delete(`/roles/${self.deleteRolePayload}`)
        .then(function (response) {
          self.deleteRolePayload = ''
          self.deleteBtnIsLoading = false
          self.getRolesList()
          self.confirmRoleDelete = false
          self.$q.notify({
            icon: 'done',
            type: 'positive',
            timeout: 7000,
            position: 'top',
            message: 'Role deleted successfully'
          })
        })
        .catch(function (error) {
          if (error.response.status === 403) {
            self.confirmRoleDelete = false
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
    this.getRolesList()
  }
})
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 450px;
}
</style>