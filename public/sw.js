if(!self.define){let e,s={};const a=(a,i)=>(a=new URL(a+".js",i).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(i,c)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(s[n])return;let t={};const r=e=>a(e,n),u={module:{uri:n},exports:t,require:r};s[n]=Promise.all(i.map((e=>u[e]||r(e)))).then((e=>(c(...e),t)))}}define(["./workbox-c06b064f"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/192.png",revision:"dd433d3be632fb54975ad0fd7c335dc2"},{url:"/384.png",revision:"6e33b25becfe4d62fdd5bea74ac922df"},{url:"/Product Sans Bold Italic.ttf",revision:"79750b1d82b2558801373d62dd7e5280"},{url:"/Product Sans Bold.ttf",revision:"dba0c688b8d5ee09a1e214aebd5d25e4"},{url:"/Product Sans Italic.ttf",revision:"e88ec18827526928e71407a24937825a"},{url:"/Product Sans Regular.ttf",revision:"eae9c18cee82a8a1a52e654911f8fe83"},{url:"/RethinkSans-ExtraBold.ttf",revision:"1b413f9e634e69348afdb88e660289d4"},{url:"/RethinkSans-ExtraBoldItalic.ttf",revision:"9cb729629762dd43fea57f0b8e8ce2a8"},{url:"/RethinkSans-Italic-VariableFont_wght.ttf",revision:"f60b50f3dc35b5637a5e34b7e483ae70"},{url:"/RethinkSans-Medium.ttf",revision:"64f2b59cad6990c62932a0403f7afb5d"},{url:"/RethinkSans-MediumItalic.ttf",revision:"7827aa720ad5a8c3475e252d2375fd6e"},{url:"/RethinkSans-SemiBold.ttf",revision:"f58a785990f1f1d12b1518ffc5340e71"},{url:"/RethinkSans-SemiBoldItalic.ttf",revision:"808bb87be9ccc78ce833a7f3a92f10f7"},{url:"/Stars.jpg",revision:"a97dcfa1a2d604286f61c7cae6a48690"},{url:"/_next/static/VLuhAfOXzu_Ybv8ZMkSsP/_buildManifest.js",revision:"b222cbf4d8e1f47e27a8925222733e53"},{url:"/_next/static/VLuhAfOXzu_Ybv8ZMkSsP/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/1058.7d72c970b170b747.js",revision:"7d72c970b170b747"},{url:"/_next/static/chunks/1827-931d1d8549575c4f.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/2107-5027e6668ba0b098.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/231-e3822841dfe00855.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/2769.8c6c5d51900c4d17.js",revision:"8c6c5d51900c4d17"},{url:"/_next/static/chunks/2924.5ca630e6cc73b565.js",revision:"5ca630e6cc73b565"},{url:"/_next/static/chunks/2960.5233a53897948f30.js",revision:"5233a53897948f30"},{url:"/_next/static/chunks/3590-cafb50690314d65c.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/39209d7c-b7c007967a66dc41.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/4002-539cd7cf4342de79.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/4144.057aa29f43b9de10.js",revision:"057aa29f43b9de10"},{url:"/_next/static/chunks/4412.0ccc6b80dd2ae813.js",revision:"0ccc6b80dd2ae813"},{url:"/_next/static/chunks/472688b4-e04ab7cbdbc8e4fa.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/5080.cec03099b166d932.js",revision:"cec03099b166d932"},{url:"/_next/static/chunks/5190-915c55f8c9c00918.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/5197.7ae76f0b2d9f7477.js",revision:"7ae76f0b2d9f7477"},{url:"/_next/static/chunks/5546.bc9fb53404c88266.js",revision:"bc9fb53404c88266"},{url:"/_next/static/chunks/5886-50bb9efac77a0a6f.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/6197.d99fb02f378447ce.js",revision:"d99fb02f378447ce"},{url:"/_next/static/chunks/6648-a00f6222ae15d4ba.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/672-5ba83a1a2e4dc253.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/7074.42433cabd88da255.js",revision:"42433cabd88da255"},{url:"/_next/static/chunks/78-b04736b423ad28a0.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/8093.53577259c0b46dfc.js",revision:"53577259c0b46dfc"},{url:"/_next/static/chunks/8129.c71a64ba5afd955a.js",revision:"c71a64ba5afd955a"},{url:"/_next/static/chunks/8251-23fca8b17b182fce.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/8407.2d76508265fa61b0.js",revision:"2d76508265fa61b0"},{url:"/_next/static/chunks/8462-deed98cc27adf26d.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/8467.a6709d8690d03de4.js",revision:"a6709d8690d03de4"},{url:"/_next/static/chunks/8726-61f98265d256de02.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/8838.a51b0ea3df709537.js",revision:"a51b0ea3df709537"},{url:"/_next/static/chunks/8925.f195764c701e2b35.js",revision:"f195764c701e2b35"},{url:"/_next/static/chunks/9081a741-d44f478aa637463b.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/9438-7c3aa4f3a323d093.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/9445.c0a2a5b5667771ff.js",revision:"c0a2a5b5667771ff"},{url:"/_next/static/chunks/9816-1fa615e14b2fe80c.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/9854-ead03bc8ad9dd242.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/9875.8cbbd04935adac18.js",revision:"8cbbd04935adac18"},{url:"/_next/static/chunks/app/%5Bslug%5D/layout-5e79a5c48921fd5a.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/%5Bslug%5D/page-76ea16360376659f.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/%5Bslug%5D/post/%5Bslug1%5D/page-c71b69f614912f73.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/_not-found/page-f81db61728a92d5d.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/feed/explore/page-9140d4e975a728b2.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/feed/layout-deefd36a3b2fe254.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/feed/messages/page-62ec9c7e15dd5aae.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/feed/page-bf90f61450ac817d.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/feed/profile/%5Bslug%5D/page-7da76e4b4287ae2e.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/feed/reels/page-1f4a2c7f9bf8a68f.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/feed/settings/page-e67c3dbafeb87525.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/layout-a16e3e113cbeefc7.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/login/page-30f8f04e454bbc26.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/page-1ec91771e977bb29.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/releasenotes/page-bb81e734b3953332.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/report/page-d12d65b72fd989e7.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/signup/page-ff444edcef07aa5d.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/sitemap/page-ada699af72925d28.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/tcs/page-51e6fce02e36762f.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/app/test/page-82f86c9da2f28d16.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/bc9c3264-7dade76820774d64.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/bc9e92e6-b109cb25e3810344.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/c15bf2b0-c5f2ab0c4ce668d5.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/fb215ee9-34ce651f9957854c.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/fd9d1056-9c7e48bf92f11728.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/framework-20adfd98f723306f.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/main-451db962dbb524f8.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/main-app-7009a5223723c6a0.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/pages/_app-00b74eae5e8dab51.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/pages/_error-c72a1f77a3c0be1b.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-1aac95d7fc6b854e.js",revision:"VLuhAfOXzu_Ybv8ZMkSsP"},{url:"/_next/static/css/33c89cb3a78821b3.css",revision:"33c89cb3a78821b3"},{url:"/_next/static/css/7f0f9be3ab8b4265.css",revision:"7f0f9be3ab8b4265"},{url:"/_next/static/css/802d9b969a99235d.css",revision:"802d9b969a99235d"},{url:"/_next/static/css/a244f157b38dfab8.css",revision:"a244f157b38dfab8"},{url:"/_next/static/media/05a31a2ca4975f99-s.woff2",revision:"f1b44860c66554b91f3b1c81556f73ca"},{url:"/_next/static/media/32db52a016290167-s.p.ttf",revision:"dba0c688b8d5ee09a1e214aebd5d25e4"},{url:"/_next/static/media/364e202ba21fa6fa-s.p.ttf",revision:"79750b1d82b2558801373d62dd7e5280"},{url:"/_next/static/media/3dbff6fd08cce238-s.p.ttf",revision:"e88ec18827526928e71407a24937825a"},{url:"/_next/static/media/513657b02c5c193f-s.woff2",revision:"c4eb7f37bc4206c901ab08601f21f0f2"},{url:"/_next/static/media/51ed15f9841b9f9d-s.woff2",revision:"bb9d99fb9bbc695be80777ca2c1c2bee"},{url:"/_next/static/media/7eb8b39df1ae2ded-s.p.ttf",revision:"eae9c18cee82a8a1a52e654911f8fe83"},{url:"/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2",revision:"74c3556b9dad12fb76f84af53ba69410"},{url:"/_next/static/media/d6b16ce4a6175f26-s.woff2",revision:"dd930bafc6297347be3213f22cc53d3e"},{url:"/_next/static/media/ec159349637c90ad-s.woff2",revision:"0e89df9522084290e01e4127495fae99"},{url:"/_next/static/media/f84675713043186b-s.p.ttf",revision:"85bb2d0ec4a0da159de42e89089ccc0b"},{url:"/_next/static/media/fd4db3eb5472fc27-s.woff2",revision:"71f3fcaf22131c3368d9ec28ef839831"},{url:"/btngif.gif",revision:"ee549ec9cb00e32319b12e517a448734"},{url:"/chatbg/heaven.jpeg",revision:"91b083390c17c94643de91bc10e038b3"},{url:"/chatbg/love.jpeg",revision:"b178149d807f28da0404a10343c5d8ba"},{url:"/chatbg/space.jpg",revision:"49d09e87fc7b0ca7c72638c60f1e80cd"},{url:"/closefullscreen.svg",revision:"2b163563f1e261be5db9699aff32e1fd"},{url:"/fullscreen.svg",revision:"2be8c19702dfcbb6e0a6df1b51526ea0"},{url:"/gta.jpeg",revision:"d4cd58c5f11fe62fb56f507bc8d00942"},{url:"/icon.png",revision:"429169a48c96f6a95cfc2796cf019cf6"},{url:"/icons/add-group.png",revision:"07e14fc57877625d8ce872cf15eef912"},{url:"/icons/arrow.png",revision:"cfbc6c305c365a84b6aa38fb09de419a"},{url:"/icons/attach.png",revision:"23ab5d0f424d10625e0f0449019e825d"},{url:"/icons/cancel.png",revision:"69c576a945a332d6a8a66b1458448933"},{url:"/icons/category.png",revision:"ea6adac9357e7ea24212b8bd11b00124"},{url:"/icons/check-mark.png",revision:"d2ab6078c3bcadb9142018c6e71831ae"},{url:"/icons/clear.png",revision:"707b12a601c8b0b308c455bb52a0b4cc"},{url:"/icons/close.png",revision:"bf2628e43f68f292fa97d1a51a9b0a73"},{url:"/icons/comment.png",revision:"91375a29c8ff18161995c2539a14681d"},{url:"/icons/conversation.png",revision:"e63244ba366849096bffe0e592e4bd74"},{url:"/icons/copy.png",revision:"597b96efa2bff71da296eac720de1ec7"},{url:"/icons/delete.png",revision:"94fe9f2bc1c059f27df2bbb19bb708e9"},{url:"/icons/direction.png",revision:"661a4b37922e748267e1fcae84519b58"},{url:"/icons/editing.png",revision:"3705724d0c88aee08c24d058d1bba052"},{url:"/icons/gif.png",revision:"69034a6297c59c42c3fc409557f1c95e"},{url:"/icons/info.png",revision:"357f3005482c720801955087960fc041"},{url:"/icons/mute.png",revision:"a5c7f46fda46b344411052c1507bb016"},{url:"/icons/notification.png",revision:"18a2495ca85b1349d0b23c25f8042a28"},{url:"/icons/price-tag.png",revision:"8a274023df5804b1888b5dadfa7cf1d8"},{url:"/icons/read.png",revision:"2e1ff6451656999119c51cabb679f1e7"},{url:"/icons/reply.png",revision:"eb82f8cfad1b77af43734724d56a8e2a"},{url:"/icons/save.png",revision:"28e3514d97b5243da73e58e617bf94a0"},{url:"/icons/search.png",revision:"30dcd67b885a6a4eec8ad26fd207a1f7"},{url:"/icons/send.png",revision:"64d360dc6de7f93095ffe32e3f53c804"},{url:"/icons/setting.png",revision:"b06645d217f95d707c09431bb83feb72"},{url:"/icons/sidebar.png",revision:"72d1d2978cbeba75ed1a4bef98cb1aab"},{url:"/icons/slidedown.png",revision:"f7af826b30811ac8427493749edadcbb"},{url:"/icons/soundon.png",revision:"a5706847badbaa81aa8a11b14347a39f"},{url:"/icons/supermarket.png",revision:"52ee0ea8c3832866fbdefd671aa40280"},{url:"/icons/video.png",revision:"5229132bda4b3f230bd6e833174ed730"},{url:"/icons/war.png",revision:"4da5c0f021b73a3dc093b4d34b4b6e4f"},{url:"/icons/warning.png",revision:"b1e5c9ef2ea556ec3260a2a727725006"},{url:"/loading.gif",revision:"2225b537a65fa3ccc1950c1db447299a"},{url:"/main/p1.png",revision:"f231c61c899fc4f08d68a4bc455931ff"},{url:"/main/p2.png",revision:"2de64033a306cbc1d9a80b871b5cee24"},{url:"/main/p3.png",revision:"2a07b1f3390affd13fe532c9d95b8226"},{url:"/main/p4.png",revision:"75c69b931588211f82647b24320134b8"},{url:"/manifest.json",revision:"0d4c9fbd4fb1dcf495b7ab972121aa7c"},{url:"/mus512.png",revision:"ab48b9f3b4cd8b355a9c3e4a61755ba7"},{url:"/nature.jpg",revision:"ff516ad0cbad1a5840d08fc344618dff"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/share.png",revision:"89f7def691614353566609adbe174ffb"},{url:"/sounds/in.m4a",revision:"15d23381bdb2786a4e8e8748d18f50f7"},{url:"/sounds/inbox.m4a",revision:"b5ea02e517ecd90084b30b82e61acf20"},{url:"/sounds/inbox.mp3",revision:"eef1a40f4ccb5c8015d3943e697e27bd"},{url:"/sounds/out.m4a",revision:"dd7a05bab1846469544b25e567ca727e"},{url:"/suc.png",revision:"f9b1af8b13136b323269c99bdeb8cae7"},{url:"/swe-worker-5c72df51bb1f6ee0.js",revision:"5a47d90db13bb1309b25bdf7b363570e"},{url:"/vercel.svg",revision:"61c6b19abff40ea7acd577be818f3976"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({response:e})=>e&&"opaqueredirect"===e.type?new Response(e.body,{status:200,statusText:"OK",headers:e.headers}):e}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/\/_next\/static.+\.js$/i,new e.CacheFirst({cacheName:"next-static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4|webm)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:48,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e,url:{pathname:s}})=>!(!e||s.startsWith("/api/auth/callback")||!s.startsWith("/api/"))),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:a})=>"1"===e.headers.get("RSC")&&"1"===e.headers.get("Next-Router-Prefetch")&&a&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc-prefetch",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:a})=>"1"===e.headers.get("RSC")&&a&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:{pathname:e},sameOrigin:s})=>s&&!e.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e})=>!e),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
