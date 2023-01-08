<template>
  <q-page padding>
    <div class="row q-pb-xl justify-center q-gutter-sm-md">
      <!-- Title -->
      <div class="col-12 col-sm-10 col-lg-8 col-xl-6 q-mx-xl-xl">
        <back-button />
        <div class="row">
          <div
            :class="[
              $q.screen.lt.sm ? 'text-center' : '',
              'col-12 col-sm-6 text-h5 q-pb-md q-pl-sm lt-sm'
            ]"
          >
            Users List
          </div>
          <div
            :class="[
              $q.screen.lt.sm ? 'text-center' : '',
              'col-12 col-sm-6 text-h4 q-pb-md q-pl-sm gt-xs'
            ]"
          >
            Users List
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="col-12 col-sm-10 col-lg-8 col-xl-6 q-pt-lg q-pt-sm-none">
        <q-table
          row-key="email"
          class="col-12"
          :columns="columns"
          :rows="userList"
          :loading="tableIsLoading"
          :rows-per-page-options="[10, 25, 50, 0]"
          table-header-class="bg-green-1 text-green-10"
        >
          <template v-slot:loading>
            <q-spinner-tail
              color="primary"
              size="3em"
              class="tw-mx-auto"
            />
          </template>
          
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td
                key="firstname"
                :props="props"
                class="text-primary tw-uppercase tw-text-lg tw-font-medium"
                @click="$router.push({
                  name: 'user-detail',
                  params: { uuid: props.row.uuid }
                })"
              >
                {{ props.row.firstname }}
              </q-td>
              <q-td
                key="lastname"
                :props="props"
                class="text-primary tw-uppercase tw-text-lg tw-font-medium"
              >
                {{ props.row.lastname }}
              </q-td>
              <q-td
                key="email"
                :props="props"
                class="text-primary tw-uppercase tw-text-lg tw-font-medium"
              >
                {{ props.row.email }}
              </q-td>
              <q-td :props="props" key="actions">
                <q-btn flat color="grey-7" round icon="more_vert" />
                <q-menu :offset="[0, -10]" class="shadow-12" auto-close>
                  <q-list style="width: 200px;">
                    <q-item clickable @click="makePassChangePayload(props.row)">
                      <q-item-section>
                        Change Password
                      </q-item-section>
                    </q-item>
                    <q-item clickable @click="deleteUser(props.row)">
                      <q-item-section>
                        Delete User
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>

      <!-- Change password modal/dialog -->
      <q-dialog persistent v-model="passwordChangeDialog">
        <q-card class="q-pa-sm text-body1">
          <q-card-section v-if="passwordChanged" class="q-px-sm">
            <div class="text-negative q-pb-md">
              Warning! This password will only be shown once. Please save and store it in a safe place.
            </div>
            <q-card class="q-px-sm q-py-lg bg-grey-3 text-center">
              <div class="text-h3">
                <strong>{{ changedPasswordText }}</strong>
              </div>
            </q-card>
          </q-card-section>
          <q-card-section v-else class="q-px-sm">
            Are you sure you want to change <span class="text-weight-bold">{{ passwordChangePayload.email }}'s ({{ passwordChangePayload.firstname }} {{ passwordChangePayload.lastname }})</span> password? They'll not be able to use the current password to log in after you change it.
          </q-card-section>
          <q-card-actions v-if="passwordChanged" align="right" class="q-gutter-sm">
            <q-btn
              outline
              no-caps
              label="Close"
              v-close-popup
              color="primary"
              padding="xs lg"
            />
          </q-card-actions>
          <q-card-actions v-else align="right" class="q-gutter-sm">
            <q-btn
              outline
              no-caps
              v-close-popup
              label="Cancel"
              color="grey-8"
              padding="xs lg"
            />
            <q-btn
              no-caps
              unelevated
              padding="xs lg"
              color="negative"
              @click="changePassword"
              label="Change User Password"
              :loading="changePasswordBtnLoading"
              :disabled="changePasswordBtnLoading"
            />
          </q-card-actions>
          <q-inner-loading :showing="changePasswordBtnLoading">
            <q-spinner size="50px" color="primary" />
          </q-inner-loading>
        </q-card>
      </q-dialog>
    </div>
  </q-page>

  <!-- change password modal -->
  <q-dialog v-model="newPasswordModal" persistent>
    <q-card class="my-card">
      <q-card-section class="row items-center q-py-sm">
        <div class="text-h5">User New Password</div>
        <q-space />
        <q-btn v-close-popup outline size="sm" color="primary" label="Close" />
      </q-card-section>
      <q-card-section class="tw-mt-8 tw-mb-12">
        <div class="tw-text-lg tw-text-center">
          <q-input outlined readonly v-model="changedPasswordText" :dense="dense">
            <template v-slot:append>
              <q-icon @click="copyPasswordText" name="fas fa-thin fa-copy" />
            </template>
          </q-input>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script>
import { defineComponent, ref, reactive, computed } from 'vue';
import { api } from 'boot/axios';
import { getMetaData } from 'boot/utils';
import { useQuasar, copyToClipboard } from 'quasar';
import BackButton from 'src/components/BackButton.vue';
const tableCols = [
  { name: 'firstname', label: 'FIRST NAME', field: 'firstname', align: 'left', classes: 'cursor-pointer', sortable: true },
  { name: 'lastname', label: 'LAST NAME', field: 'lastname', align: 'left', sortable: true },
  { name: 'email', label: 'EMAIL', field: 'email', align: 'left', sortable: true },
  { name: 'actions', align: 'left'}
]
export default defineComponent({
  name: 'UserList',
  mixins: [getMetaData('User List')],

  components: {
    BackButton
  },
  
  setup() {
    const userList = ref([]);
    const tableIsLoading = ref(false);
    const passwordChanged = ref(false)
    const changedPasswordText = ref('')
    const passwordChangePayload = ref({})
    const passwordChangeDialog = ref(false)
    const changePasswordBtnLoading = ref(false)
    const deleteDialog = ref(false)
    const newPasswordModal = ref(false)
    const deleteBtnIsLoading  = ref(false)
    const isPwd = ref(true)
    const newPassword = reactive({
      password: ''
    })

    const $q = useQuasar();
    
    getUserList();

    function getAuthToken () {
      return $q.localStorage.getItem('authToken')
    }
    
    function getUserList () {
      tableIsLoading.value = true;
      api.defaults.headers.common = {
        Authorization: `Bearer ${getAuthToken()}`
      }
      api.get('/users')
        .then((response) => {
          userList.value = response.data;
          tableIsLoading.value = false;
        })
    }

    const makePassChangePayload = (payload) => {
      passwordChangePayload.value = payload
      passwordChangeDialog.value = true
    }

    const changePassword = () => {
      changePasswordBtnLoading.value = true
      api.defaults.headers.common = {
        Authorization: `Bearer ${getAuthToken()}`
      }
      api.put(`/users/change_password/${passwordChangePayload.value.uuid}`)
        .then(function (response) {
          passwordChangeDialog.value = false
          changedPasswordText.value = response.data.password
          changePasswordBtnLoading.value = false
          newPasswordModal.value = true
          $q.notify({
            timeout: 5000,
            position: 'top',
            type: 'positive',
            message: 'Password changed successfully',
            actions: [{ icon: 'close', color: 'green-2' }]
          })
        })
        .catch(function (error) {
          changePasswordBtnLoading.value = false
          if (error.response.status === 403) {
            $q.notify({
              timeout: 15000,
              position: 'top',
              type: 'negative',
              message: error.response.data.detail,
              actions: [{ icon: 'close', color: 'red-2' }]
            })
          }
        })
    }

    const copyPasswordText = async() => {
      copyToClipboard(changedPasswordText.value)
        .then(() => {
          $q.notify({
            timeout: 5000,
            position: 'top',
            type: 'positive',
            message: 'Password copied successfully',
            actions: [{ icon: 'close', color: 'green-2' }]
          })
        })
        .catch(() => {
          $q.notify({
            timeout: 15000,
            position: 'top',
            type: 'negative',
            message: 'Failed to copy password',
            actions: [{ icon: 'close', color: 'red-2' }]
          })
        })
    }


    const makeDeletePayload = (payload) => {
      deletePayload = payload
      deleteDialog.value = true
    }

    const changePasswordRequired = computed(() => {
      return (
        !newPassword.password
      )
    })

    const confirmChangePass = () => {
      passwordChangeDialog.value = false
      newPasswordModal.value = true
    }

    const deleteUser = (payload) => {
      console.log(payload.uuid);
      deleteBtnIsLoading.value = true
      api.defaults.headers.common = {
        Authorization: `Bearer ${getAuthToken()}`
      }
      api.delete(`/users/${payload.uuid}`)
        .then(function () {
          deleteBtnIsLoading.value = false
          getUserList()
          deleteDialog.value = false
          $q.notify({
            timeout: 5000,
            position: 'top',
            type: 'positive',
            message: 'User deleted successfully',
            actions: [{ icon: 'close', color: 'green-2' }]
          })
        })
        .catch(function (error) {
          deleteBtnIsLoading.value = false
          console.log(error)
          if (error.response.status >= 400) {
            $q.notify({
              timeout: 15000,
              position: 'top',
              type: 'negative',
              message: error.response.data.detail,
              actions: [{ icon: 'close', color: 'red-2' }]
            })
          }
        })
    }
    
    return {
      columns: tableCols,
      tableIsLoading,
      userList,
      changePassword,
      makeDeletePayload,
      deleteUser,
      deleteDialog,
      passwordChangeDialog,
      passwordChangePayload,
      makePassChangePayload,
      confirmChangePass,
      newPasswordModal,
      isPwd,
      newPassword,
      changePasswordRequired,
      changedPasswordText,
      copyPasswordText
    }
  },
})
</script>


<style scoped>
.my-card {
  width: 100%;
  max-width: 450px;
}
</style>