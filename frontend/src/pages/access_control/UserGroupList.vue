<template>
  <q-page padding>
    <div class="row q-pb-xl justify-center q-gutter-sm-md">
      <!-- Title -->
      <div class="col-12 col-sm-10 col-lg-7 q-mx-xl-xl text-primary">
        <back-btn />
        <div class="row q-gutter-y-sm q-pb-md">
          <div class="col-12 col-sm-6 text-h4">User Groups</div>
          <div class="col-12 col-sm-6">
            <q-btn
              no-caps
              color="primary"
              label="Add New Group"
              @click="newGroup = true"
              :disabled="tableIsLoading"
              :class="[$q.screen.lt.sm ? 'full-width' : 'float-right']"
            />
          </div>
        </div>
      </div>

      <!-- Groups Table -->
      <div class="col-12 col-sm-10 col-lg-7">
        <q-table
          row-key="name"
          class="col-12"
          :columns="columns"
          :rows="groupsList"
          :loading="tableIsLoading"
          :rows-per-page-options="[10, 25, 50, 0]"
          table-header-class="bg-green-1 text-green-10"
        >
          <template v-slot:body-cell-group="props">
            <q-td
              :props="props"
              @click="$router.push({
                name: 'group-detail',
                params: { groupName: props.row.name }
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

    <!-- New Group modal/dialog -->
    <q-dialog
      persistent
      v-model="newGroup"
      :maximized="$q.screen.lt.sm"
      @hide="newGroupPayload = { name: '', description: '' }"
    >
      <q-card class="my-card">
        <q-card-section class="row items-center q-py-sm">
          <div class="text-h5">New Group</div>
          <q-space />
          <q-btn v-close-popup outline size="sm" color="primary" label="Close" />
        </q-card-section>
        <q-separator />

        <q-card-section>
          <form v-on:submit.prevent.stop="addNewGroup" class="q-gutter-md">
            <q-input
              ref="name"
              outlined
              type="text"
              label="Name"
              bottom-slots
              hide-bottom-space
              :error="newGroupError.status"
              :error-message="newGroupError.message"
              v-model="newGroupPayload.name"
              :rules="[ val => !!val || 'This field is required.' ]"
              @input="newGroupError.status = false"
            />
            <q-input
              autogrow
              outlined
              hide-bottom-space
              label="Description"
              v-model="newGroupPayload.description"
            />
            <q-card-actions class="q-gutter-y-sm q-px-none">
              <q-btn
                no-caps
                type="submit"
                label="Add New Group"
                color="primary"
                class="full-width"
                :disabled="newGroupBtnLoading"
                :loading="newGroupBtnLoading"
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

    <!-- Delete group modal/dialog -->
    <q-dialog v-model="confirmGroupDelete" persistent>
      <q-card class="q-pa-sm text-body1">
        <q-card-section class="q-px-sm">
          Are you sure you want to delete <span class="text-weight-bold">{{ deleteGroupPayload }}</span>? You will not be able to make changes after deleting it.
        </q-card-section>
        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn
            outline
            no-caps
            label="Cancel"
            color="grey-8"
            padding="xs lg"
            class="q-px-md"
            v-close-popup
          />
          <q-btn
            no-caps
            unelevated
            color="negative"
            padding="xs lg"
            label="Delete Group"
            @click="deleteGroup"
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
  { name: 'group', label: 'GROUPS', field: 'name', align: 'left', classes: 'cursor-pointer', sortable: true },
  { name: 'delete', label: '', align: 'right' }
]
export default defineComponent({
  name: 'UserGroupList',
  mixins: [getMetaData('User Groups')],
  data () {
    return {
      newGroup: false,
      columns: tableCols,
      tableIsLoading: false,
      newGroupBtnLoading: false,
      confirmGroupDelete: false,
      deleteBtnIsLoading: false,
      newGroupPayload: {
        name: '',
        description: ''
      },
      newGroupError: {
        status: false,
        message: ''
      },
      deleteGroupPayload: {
        name: '',
        description: ''
      },
      groupsList: []
    }
  },
  methods: {
    getAuthToken () {
      return this.$q.localStorage.getItem('authToken')
    },
    getgroupsList () {
      const self = this
      if (self.groupsList.length === 0) {
        self.tableIsLoading = true
      }
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.get('/groups')
        .then(function (response) {
          self.groupsList = response.data
          self.tableIsLoading = false
        })
    },
    addNewGroup () {
      const self = this
      self.newGroupBtnLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.post('/groups', self.newGroupPayload)
        .then(function (response) {
          self.newGroupPayload = ''
          self.newGroupBtnLoading = false
          self.newGroup = false
          self.getgroupsList()
          self.$q.notify({
            icon: 'done',
            type: 'positive',
            timeout: 5000,
            position: 'top',
            message: 'Group added successfully'
          })
        })
        .catch(function (error) {
          self.newGroupError.message = error.response.data.detail
          self.newGroupError.status = true
          self.newGroupBtnLoading = false
        })
    },
    makeDeletePayload (payload) {
      this.deleteGroupPayload = payload
      this.confirmGroupDelete = true
    },
    deleteGroup () {
      const self = this
      self.deleteBtnIsLoading = true
      this.$api.defaults.headers.common = {
        Authorization: `Bearer ${self.getAuthToken()}`
      }
      self.$api.delete(`/groups/${self.deleteGroupPayload}`)
        .then(function (response) {
          self.deleteBtnIsLoading = false
          self.getgroupsList()
          self.confirmGroupDelete = false
          self.$q.notify({
            icon: 'done',
            type: 'positive',
            timeout: 7000,
            position: 'top',
            message: 'Group deleted successfully'
          })
        })
        .catch(function (error) {
          if (error.response.status === 403) {
            self.confirmGroupDelete = false
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
    this.getgroupsList()
  }
})
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 450px;
}
</style>