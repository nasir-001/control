import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import adminRoutes from './admin.routes'

import { api } from 'boot/axios'
import { hasPermission } from 'boot/utils'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const ROUTES = [
  ...adminRoutes,
]

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes: ROUTES,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    const authToken = localStorage.getItem('authToken')

    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (authToken === null) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
      else {
        if (to.matched.some(record => record.meta.requiresSuperAdmin) && !hasPermission(authToken, 'can_create_group')) {
          next({ name: 'error404' })
        } else if (to.matched.some(record => record.meta.requiresAgent) && !hasPermission(authToken, 'can_view_agent_dashboard')) {
          next({ name: 'error404' })
        } else if (to.matched.some(record => record.meta.requiresConductor) && !hasPermission(authToken, 'can_view_payment_user_dashboard')) {
          next({ name: 'error404' })
        } else if (to.matched.some(record => record.meta.requiresConductorAdmin) && !hasPermission(authToken, 'can_view_payment_admin_dashboard')) {
          next({ name: 'error404' })
        } else if (to.matched.some(record => record.meta.requiresInvestor) && !hasPermission(authToken, 'can_view_investor_dashboard')) {
          next({ name: 'error404' })
        } else if (to.matched.some(record => record.meta.requiresAssocAdmin) && !hasPermission(authToken, 'can_view_assoc_admin_dashboard')) {
          next({ name: 'error404' })
        } else if (to.matched.some(record => record.meta.requiresPrintID) && !hasPermission(authToken, 'can_print_driver_card')) {
          next({ name: 'error404' })
        } else if (to.matched.some(record => record.meta.requiresGeneralAdmin) && !hasPermission(authToken, 'can_perform_general_admin_tasks')) {
          next({ name: 'error404' })
        } else if (to.matched.some(record => record.meta.requiresRegAdmin) && !hasPermission(authToken, 'can_view_reg_admin_dashboard')) {
          next({ name: 'error404' })
        } else if (to.matched.some(record => record.meta.requiresUpdateAdmin) && !hasPermission(authToken, 'can_view_update_admin_dashboard')) {
          next({ name: 'error404' })
        } else if (to.matched.some(record => record.meta.requiresAccountantAdmin) && !hasPermission(authToken, 'can_view_accountant_dashboard')) {
          next({ name: 'error404' })
        } else {
          next()
        }
      }
    } else if (authToken !== null) {
      if (to.matched.some(record => record.meta.isRootPath)) {
        if (hasPermission(authToken, 'can_create_group')) {
          next({ name: 'legacy-dashboard' })
        } else if (hasPermission(authToken, 'can_view_agent_dashboard')) {
          next({ name: 'agent-dashboard' })
        }
      } else {
        next()
      }
    } else {
      next()
    }
  })

  return Router
})
