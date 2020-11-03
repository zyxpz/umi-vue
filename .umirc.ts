import { defineConfig } from 'umi';

export default defineConfig({
  vue: {
    is: true,
    vuex: true,
    routers: [
      {
        path: '/',
        name: 'index',
        component: '@/pages/index/index.vue'
      },
      {
        path: '/home',
        name: 'home',
        component: '@/pages/home/index.vue'
      }
    ]
  },
  nodeModulesTransform: {
    type: 'none',
  },
  plugins: ['./plugin.ts']
});
