import { createRouter, createWebHistory } from 'vue-router'
import login from '@/pages/login'
import resume from '@/pages/resume'
import home from '@/pages/home'
import question from '@/pages/question'
import userHome from '@/pages/user-home'
import userQuestion from '@/pages/user-question'
import interview from '@/pages/interview-prepare/interview'
import preparation from '@/pages/interview-prepare/preparation'
import report from '@/pages/interview-prepare/report'
import aichat from '@/pages/aicoach/aichat'
import aicoachhome from '@/pages/aicoach/aicoachhome'
import user from '@/pages/user'

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: login },
  { path: "/resume", component: resume },
  { path: "/home", component: home },
  { path: "/question", component: question },
  { path:"/user-home",component:userHome},
  { path:"/user-question",component:userQuestion},
  { path: "/interview-prepare", redirect: "/preparation" },
  { path: "/interview", component: interview },
  { path: "/preparation", component: preparation },
  { path: "/report", component: report },
  { path: "/aicoach", redirect: "/aicoachhome" },
  { path: "/aichat", component: aichat },
  { path: "/aicoachhome", component: aicoachhome },
  { path: "/user", component: user },
  { path: "/:pathMatch(.*)*", redirect: "/login" }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


// router.beforeEach((to, from, next) => {
//   next()
// })

export default router