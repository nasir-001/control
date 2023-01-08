<template>
  <q-layout view="hHh LpR fFf">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>
          Kloud97 <q-badge label="Admin" align="middle" color="white" text-color="primary" />
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item
          exact
          v-ripple
          clickable
          :to="child.to"
          :key="child.title"
          active-class="text-primary"
          v-for="child in normlinks"
        >
          <q-item-section avatar>
            <q-icon :name="child.icon" />
          </q-item-section>

          <q-item-section>{{ child.title }}</q-item-section>
        </q-item>
        <q-expansion-item
          expand-separator
          :key="link.title"
          :icon="link.icon"
          :label="link.title"
          v-for="link in links"
          :model-value="showOpen(link.showOpenExpansionStr)"
          :header-class="[showOpen(link.showOpenExpansionStr) ? 'text-primary' : '']"
          :expand-icon-class="[showOpen(link.showOpenExpansionStr) ? 'text-primary' : '']"
        >
          <q-item
            exact
            v-ripple
            clickable
            :to="child.to"
            :inset-level="0.3"
            :key="child.title"
            active-class="text-primary"
            v-for="child in link.children"
          >
            <q-item-section avatar>
              <q-icon :name="child.icon" />
            </q-item-section>

            <q-item-section>{{ child.title }}</q-item-section>
          </q-item>
        </q-expansion-item>
        <q-item
          tag="a"
          clickable
          @click="logout"
        >
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'
const linksData = [
  {
    title: 'Manage Users',
    icon: 'people_outline',
    showOpenExpansionStr: 'admin/users',
    children: [
      {
        title: 'Add New User',
        icon: 'mdi-account-plus-outline',
        to: { name: 'new-user' }
      },
      {
        title: 'Users List',
        icon: 'people_outline',
        to: { name: 'user-list' }
      }
    ]
  },
  {
    title: 'Access Control',
    icon: 'mdi-account-key-outline',
    showOpenExpansionStr: 'admin/acl/',
    children: [
      {
        title: 'User Permissions',
        icon: 'mdi-account-lock-outline',
        to: { name: 'permission-list' }
      },
      {
        title: 'User Roles',
        icon: 'mdi-redhat',
        to: { name: 'role-list' }
      },
      {
        title: 'User Groups',
        icon: 'mdi-account-group-outline',
        to: { name: 'group-list' }
      }
    ]
  },
  {
    title: 'Contesting Area',
    icon: 'public',
    showOpenExpansionStr: 'admin/area/',
    children: [
      {
        title: 'Polling Unit',
        // icon: 'mdi-account-lock-outline',
        to: { name: 'unit-list' }
      },
      {
        title: 'Ward',
        // icon: 'mdi-account-lock-outline',
        to: { name: 'ward-list' }
      },
      {
        title: 'Localgovernment',
        // icon: 'mdi-account-lock-outline',
        to: { name: 'localgovernment-list' }
      },
      {
        title: 'Constituency',
        // icon: 'mdi-account-lock-outline',
        to: { name: 'constituency-list' }
      },
      {
        title: 'Zone',
        // icon: 'mdi-account-lock-outline',
        to: { name: 'zone-list' }
      },
      {
        title: 'State',
        // icon: 'mdi-account-lock-outline',
        to: { name: 'state-list' }
      },      
    ]
  },
  {
    title: 'Election',
    icon: 'ti-id-badge',
    showOpenExpansionStr: 'admin/election/',
    children: [
      {
        title: 'Elections',
        // icon: 'mdi-account-lock-outline',
        to: { name: 'election-list' }
      },
      {
        title: 'Election Type',
        // icon: 'mdi-account-lock-outline',
        to: { name: 'election-type' }
      },
      {
        title: 'Current Election',
        // icon: 'mdi-account-lock-outline',
        to: { name: 'current-elections' }
      },
      {
        title: 'Election Result',
        // icon: 'mdi-account-lock-outline',
        to: { name: 'legacy-dashboard' }
      },
    ]
  },
  {
    title: 'Party',
    icon: 'mdi-home-outline',
    showOpenExpansionStr: 'admin/election/',
    children: [
      {
        title: 'Political Parties',
        // icon: 'mdi-account-lock-outline',
        to: { name: 'political-party' }
      },
    ]
  },
  {
    title: 'Candidate',
    icon: 'mdi-account-outline',
    showOpenExpansionStr: 'admin/election/',
    children: [
      {
        title: 'Add New Candidate',
        icon: 'mdi-account-plus-outline',
        to: { name: 'new-candidate' }
      },
      {
        title: 'Candidates List',
        icon: 'people_outline',
        to: { name: 'candidates-list' }
      },
    ]
  },
  {
    title: 'Agent',
    icon: 'las la-graduation-cap',
    showOpenExpansionStr: 'admin/election/',
    children: [
      {
        title: 'Add New Agent',
        icon: 'mdi-account-plus-outline',
        to: { name: 'new-agent' }
      },
      {
        title: 'Agents List',
        icon: 'people_outline',
        to: { name: 'list-agent' }
      },
    ]
  },
  {
    title: 'Super Agent',
    icon: 'las la-user-shield',
    showOpenExpansionStr: 'admin/election/',
    children: [
      {
        title: 'Add New Agent',
        icon: 'mdi-account-plus-outline',
        to: { name: 'new-ward-agent' }
      },
      {
        title: 'Agents List',
        icon: 'people_outline',
        to: { name: 'list-ward-agent' }
      },
    ]
  },
]

const normalLinks = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard-outline',
    to: { name: 'legacy-dashboard' }
  }
]
export default defineComponent({
  name: 'MainLayout',
  data () {
    return {
      leftDrawerOpen: false,
      links: linksData,
      normlinks: normalLinks
    }
  },
  methods: {
    showOpen (searchString) {
      return window.location.href.indexOf(searchString) > -1
    },
    logout () {
      window.localStorage.removeItem('permissionsList')
      window.localStorage.removeItem('authToken')
      this.$router.push('/login')
    }
  }
})
</script>