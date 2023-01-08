
const adminRoutes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), redirect: { name: 'login' } }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/auth/Login.vue'),
    meta: {
      isLoginPath: true
    }
  },
  {
    path: '/admin/users',
    component: () => import('layouts/admin/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'user-list',
        component: () => import('pages/users/UserList.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true
        }
      },
      {
        path: 'new-user',
        name: 'new-user',
        component: () => import('pages/users/NewUser.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true
        }
      },
      {
        path: 'users/:uuid',
        name: 'user-detail',
        component: () => import('pages/users/UserDetail.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true
        }
      }
    ]
  },
  {
    path: '/admin/acl',
    component: () => import('layouts/admin/AdminLayout.vue'),
    children: [
      {
        path: 'user-permissions',
        name: 'permission-list',
        component: () => import('pages/access_control/Permissions.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true
        }
      },
      {
        path: 'user-roles',
        name: 'role-list',
        component: () => import('pages/access_control/Roles.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true
        }
      },
      {
        path: 'user-roles/:roleName',
        name: 'role-detail',
        component: () => import('pages/access_control/RoleDetail.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true
        }
      },
      {
        path: 'user-groups',
        name: 'group-list',
        component: () => import('pages/access_control/UserGroupList.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true
        }
      },
      {
        path: 'user-groups/:groupName',
        name: 'group-detail',
        component: () => import('pages/access_control/UserGroupDetail.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true
        }
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default adminRoutes
