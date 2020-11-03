import path from 'path';
import fs from 'fs-extra';
import glob from 'glob';
// @ts-ignore
import VueLoaderPlugin from 'vue-loader/lib/plugin';

export default async (api: any) => {
  const vueUrl =
    process.env.NODE_ENV === 'development'
      ? [
        { src: 'https://cdn.jsdelivr.net/npm/vue/dist/vue.js' },
        { src: 'https://lib.baomitu.com/vuex/3.5.1/vuex.js' },
        { src: 'https://lib.baomitu.com/vue-router/3.4.7/vue-router.js' },
      ]
      : [
        { src: 'https://cdn.jsdelivr.net/npm/vue' },
        { src: 'https://lib.baomitu.com/vuex/3.5.1/vuex.min.js' },
        { src: 'https://lib.baomitu.com/vue-router/3.4.7/vue-router.min.js' },
      ];

  // umirc 配置项
  api.describe({
    key: 'vue', // 关键字
    config: {
      schema(joi: any) {
        return joi.object();
      },
    },
  });

  const {
    userConfig = {} as Object
  } = api;

  const {
    vue = {} as Object
  } = userConfig;

  const {
    is = false,
    routers = [] as Array<{ path: string; component: any }>,
    vuex = false as Boolean
  } = vue;

  if (is) {
    const routePath = routers.map((t: { name: string, component: string }) => {
      return `import ${t.name} from '${t.component}'`;
    });

    const route = routers.map((t: { path: string, name: string }) => {
      return `{path: '${t.path}', component: ${t.name}}`;
    });

    // 路由模板
    const routerCode: string = `
      <template>
        <div id="app">
          <router-view></router-view>
        </div>
      </template>;
      <script>
        export default {

        };
      </script>;

      <style lang="less">

      </style>
    `;

    // vuex 模板
    if (vuex) {
      const modelsCodeform: Array<string> = [];
      const modelsCode: Array<string> = [];
      glob
        .sync('**', {
          cwd: path.join(process.cwd(), 'src', 'models'),
          dot: true,
          ignore: [],
        })
        .forEach((file: string) => {
          const fromPath = path.join(process.cwd(), 'src', 'models', file);
          if (fs.statSync(fromPath).isFile()) {
            modelsCodeform.push(
              `import ${file.replace(/\.js/, '')} from '${fromPath}'`,
            );
            modelsCode.push(file.replace(/\.js/, ''));
          }
        });
      const vuexCode: string = `
        import Vue from 'vue';
        import Vuex from 'vuex';
        ${modelsCodeform.join(';')};
        Vue.use(Vuex);
        export default new Vuex.Store({
          modules: {
            ${modelsCode.join(',')},
          },
        });
      `;

      // 生成vuex
      api.onGenerateFiles(() => {
        api.writeTmpFile({
          path: 'vue/vuex.ts',
          content: vuexCode,
        });
      });
    }

    // 入口模板
    const entryCode: string = `
        import Vue from 'vue';
        import App from './App.vue';
        import routers from './routers';
        ${vuex ? 'import store from "./vuex";' : ''}
        new Vue({
          el: '#root',
          ${vuex ? 'store: store,' : ''}
          router: routers,
          render: h => h(App)
        });
      `;

    // 路由模板
    const routersCode: string = `
      import VueRouter from 'vue-router';
      import Vue from 'vue';
      Vue.use(VueRouter);
      ${routePath.join(';')};
      const routes = [${route.join(',')}];

      const router = new VueRouter({
        routes,
      });

      export default router;
    `;

    // 生成vue的入口文件
    api.onGenerateFiles(() => {
      api.writeTmpFile({
        path: 'vue/index.js',
        content: entryCode,
      });
    });

    // 生成vue项目的配置文件
    api.onGenerateFiles(() => {
      api.writeTmpFile({
        path: 'vue/App.vue',
        content: routerCode,
      });
    });

    // 生成router文件
    api.onGenerateFiles(() => {
      api.writeTmpFile({
        path: 'vue/routers.ts',
        content: routersCode,
      });
    });

    // vue不需要dva插件
    api.skipPlugins(['@umijs/plugin-dva']);

    // api.addHTMLLinks(() => {
    //   return [
    //     {
    //       rel: 'stylesheet',
    //       type: 'text/css',
    //       href: '/umi.css',
    //     },
    //   ];
    // });

    // 写入vue CDN
    api.addHTMLScripts(() => {
      return [
        ...vueUrl,
        {
          src: './vendor.js',
        },
      ];
    });

    // 配置vue webpack
    api.chainWebpack((config: any) => {
      config.entryPoints.delete('umi');

      config
        .entry('umi')
        .add(path.resolve(process.cwd(), 'src/.umi/vue/index.js'));

      config.module
        .rule('umi')
        .test(/\.vue$/)
        .include.add(path.resolve(`${process.cwd()}/src/`))
        .end()
        .use('vue-loader')
        .loader('vue-loader')
        .tap((options: any) => {
          return options;
        });

      config.plugin('vue-loader').use(VueLoaderPlugin);

      config.optimization.splitChunks({
        cacheGroups: {
          vendors: {
            test: /node_modules/,
            chunks: 'initial',
            name: 'vendor',
            priority: 10,
            enforce: true,
          },
          commons: {
            chunks: 'initial',
            minChunks: 2,
            maxInitialRequests: 5, // The default limit is too small to showcase the effect
            minSize: 0, // This is example is too small to create commons chunks
          },
        },
      });

      return config;
    });

    // chunks
    api.modifyHTMLChunks(async (memo: any, opts: any) => {
      const { route } = opts;
      // do something
      return memo;
    });

    api.modifyDefaultConfig((memo: any) => {
      return Object.assign(memo, {
        urlLoaderExcludes: [/\.vue$/],
        externals: {
          vue: 'window.Vue',
          'vue-router': 'VueRouter',
          vuex: 'Vuex',
        },
      });
    });
  }
};
