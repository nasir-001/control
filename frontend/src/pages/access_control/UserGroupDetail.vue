<template>
  <q-page padding>
    <div class="row q-pb-xl justify-center q-gutter-sm-md">
      <!-- Title -->
      <div class="col-12 col-sm-10 col-lg-7 q-mx-xl-xl text-primary" v-if="!notFound">
        <back-btn />
        <div class="row q-gutter-y-sm q-pb-md">
          <div class="col-12 col-sm-6 text-h4">{{ groupObj.name }}</div>
          <div class="col-12 col-sm-6">
            <q-btn
              no-caps
              color="primary"
              class="float-right"
              @click="addRole = true"
              label="Add Role to Group"
              :disabled="tableIsLoading"
              :class="[$q.screen.lt.sm ? 'full-width' : 'float-right']"
            />
          </div>
        </div>
      </div>

      <!-- Roles Table -->
      <div class="col-12 col-sm-10 col-lg-7">
        <not-found back v-if="notFound" />
        <q-table
          v-else
          row-key="name"
          class="col-12"
          :columns="columns"
          :rows="groupObj.roles"
          :loading="tableIsLoading"
          :rows-per-page-options="[10, 25, 50, 0]"
          table-header-class="bg-green-1 text-green-10"
        >
          <template v-slot:body-cell-role="props">
            <q-td :props="props" auto-width>
              <q-expansion-item
                dense
                expand-separator
                switch-toggle-side
                expand-icon-toggle
                :content-inset-level="1"
                :label="props.row.name"
                caption="Click arrow to view/hide role's permissions"
              >
                <div class="q-pl-sm col-6" style="max-width: 400px !important;">
                  <q-chip
                    v-for="perm in props.row.permissions"
                    :key="perm.id"
                    color="blue-1"
                    dense
                  >
                    {{ perm.name }}
                  </q-chip>
                </div>
              </q-expansion-item>
            </q-td>
          </template>

          <template v-slot:body-cell-remove="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                class="q-mr-md"
                color="negative"
                @click="removeRoleFromGroup(props.row.name)"
                icon="delete"
              >
                <q-tooltip :delay="1000" anchor="bottom middle" self="top middle" :offset="[10, 10]">
                  Remove role
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

    <!-- Add role modal/dialog -->
    <q-dialog persistent :maximized="$q.screen.lt.sm" v-model="addRole" @hide="addRolePayload = ''">
      <q-card class="my-card">
        <q-card-section class="row items-center q-py-sm">
          <div class="text-h5">Add Role</div>
          <q-space />
          <q-btn v-close-popup outline size="sm" color="primary" label="Close" />
        </q-card-section>
        <q-separator />

        <q-card-section>
          <form v-on:submit.prevent.stop="addRoleToGroup" class="q-gutter-md">
            <q-select
              ref="name"
              outlined
              type="text"
              label="Name"
              bottom-slots
              hide-bottom-space
              @filter="filterFn"
              :options="options"
              :error="roleError.status"
              :error-message="roleError.message"
              v-model="addRolePayload"
              :rules="[ val => !!val || 'This field is required.' ]"
              @input="roleError.status = false"
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
                label="Add Role"
                color="primary"
                class="full-width"
                :loading="addRoleBtnLoading"
                :disabled="addRoleBtnLoading || !addRolePayload"
              />
              <q-btn
                no-caps
                outline
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
  { name: 'role', label: 'GROUP ROLES', field: 'name', align: 'left', sortable: true },
  { name: 'remove', label: '', align: 'right' }
]
export default defineComponent({
  name: 'UserGroupDetail',
  mixins: [getMetaData('User Group')],
  data () {
    return {
      options: [],
      groupObj: {},
      rolesList: [],
      addRole: false,
      notFound: false,
      addRolePayload: '',
      columns: tableCols,
      tableIsLoading: false,
      addRoleBtnLoading: false,
      roleError: {
        status: false,
        message: ''
      }
    }
  },
  computed: {
    allRoles () {
      const groupRoles = this.groupObj.roles.map((role) => {
        return role.name
      })
      const roles = this.rolesList.map((role) => {
        return role.name
      })
      return roles.filter(role => groupRoles.indexOf(role) === -1)
    }
  },
  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.allRoles
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.options = this.allRoles.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    getAuthToken () {
      return this.$q.localStorage.getItem('authToken')
    },
    getAllRoles () {
      const self = this
      if (!self.groupObj) {
        self.tableIsLoading = true
      }
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.get('/roles')
        .then(function (response) {
          self.rolesList = response.data
        })
    },
    getGroupDetail () {
      const self = this
      if (!self.groupObj.name) {
        self.tableIsLoading = true
      }
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.get(`/groups/${self.$route.params.groupName}`)
        .then(function (response) {
          self.groupObj = response.data
          self.tableIsLoading = false
        })
        .catch(function (error) {
          if (error.response.status === 404) {
            self.tableIsLoading = false
            self.notFound = true
          }
        })
    },
    addRoleToGroup () {
      const self = this
      self.addRoleBtnLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.put(
        `/groups/${self.groupObj.name}`,
        { roles: [self.addRolePayload] }
      )
        .then(function (response) {
          self.$q.notify({
            icon: 'done',
            type: 'positive',
            timeout: 5000,
            position: 'top',
            message: 'Role added successfully'
          })
          self.addRoleBtnLoading = false
          self.getGroupDetail()
          self.getAllRoles()
          self.addRole = false
          self.addRolePayload = ''
        })
    },
    removeRoleFromGroup (role) {
      const self = this
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.delete(
        `/groups/${self.groupObj.name}/roles`,
        { data: { roles: [role] } }
      )
        .then(function (response) {
          self.$q.notify({
            icon: 'done',
            type: 'positive',
            timeout: 5000,
            position: 'top',
            message: 'Role removed successfully'
          })
          self.getGroupDetail()
          self.getAllRoles()
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
    this.getGroupDetail()
    this.getAllRoles()
  }
})
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 450px;
}
</style>