if(!self.define){let e,s={};const i=(i,c)=>(i=new URL(i+".js",c).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(c,a)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(s[n])return;let t={};const r=e=>i(e,n),o={module:{uri:n},exports:t,require:r};s[n]=Promise.all(c.map((e=>o[e]||r(e)))).then((e=>(a(...e),t)))}}define(["./workbox-f1770938"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/192.png",revision:"dd433d3be632fb54975ad0fd7c335dc2"},{url:"/384.png",revision:"6e33b25becfe4d62fdd5bea74ac922df"},{url:"/Product Sans Bold Italic.ttf",revision:"79750b1d82b2558801373d62dd7e5280"},{url:"/Product Sans Bold.ttf",revision:"dba0c688b8d5ee09a1e214aebd5d25e4"},{url:"/Product Sans Italic.ttf",revision:"e88ec18827526928e71407a24937825a"},{url:"/Product Sans Regular.ttf",revision:"eae9c18cee82a8a1a52e654911f8fe83"},{url:"/RethinkSans-ExtraBold.ttf",revision:"1b413f9e634e69348afdb88e660289d4"},{url:"/RethinkSans-ExtraBoldItalic.ttf",revision:"9cb729629762dd43fea57f0b8e8ce2a8"},{url:"/RethinkSans-Italic-VariableFont_wght.ttf",revision:"f60b50f3dc35b5637a5e34b7e483ae70"},{url:"/RethinkSans-Medium.ttf",revision:"64f2b59cad6990c62932a0403f7afb5d"},{url:"/RethinkSans-MediumItalic.ttf",revision:"7827aa720ad5a8c3475e252d2375fd6e"},{url:"/RethinkSans-SemiBold.ttf",revision:"f58a785990f1f1d12b1518ffc5340e71"},{url:"/RethinkSans-SemiBoldItalic.ttf",revision:"808bb87be9ccc78ce833a7f3a92f10f7"},{url:"/Stars.jpg",revision:"a97dcfa1a2d604286f61c7cae6a48690"},{url:"/_next/static/chunks/1058.352452304e1ba9ba.js",revision:"352452304e1ba9ba"},{url:"/_next/static/chunks/1062-298a44bc61094e7c.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/1419-1c6d9e188e552b6b.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/1449-40dda319db378964.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/2107-5027e6668ba0b098.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/2123.c1a4292b46cd06c3.js",revision:"c1a4292b46cd06c3"},{url:"/_next/static/chunks/231-62dd58476c3d63f8.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/2614-11b51a642ab68b03.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/2769.056a59554209359e.js",revision:"056a59554209359e"},{url:"/_next/static/chunks/2924.437fd84d014dcf74.js",revision:"437fd84d014dcf74"},{url:"/_next/static/chunks/2960.8787dbc5c98d72e0.js",revision:"8787dbc5c98d72e0"},{url:"/_next/static/chunks/2973-c218aedfa81e9267.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/3363-9b58578920cf2ec8.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/3511.2f2e62a52d831997.js",revision:"2f2e62a52d831997"},{url:"/_next/static/chunks/39209d7c-b7c007967a66dc41.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/4144.3e430a4c40405c7d.js",revision:"3e430a4c40405c7d"},{url:"/_next/static/chunks/4412.14b7749d1a52744b.js",revision:"14b7749d1a52744b"},{url:"/_next/static/chunks/472688b4.7c21628e3c36da71.js",revision:"7c21628e3c36da71"},{url:"/_next/static/chunks/4899-5e766df185a2def2.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/4962-293b765186464766.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/506-d972495a56d9d147.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/5080.f3e3c626dfd9480b.js",revision:"f3e3c626dfd9480b"},{url:"/_next/static/chunks/5190-9279b0aee20e2e56.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/5197.3c64cdf1f0c12c64.js",revision:"3c64cdf1f0c12c64"},{url:"/_next/static/chunks/5218.1417d89149dce77d.js",revision:"1417d89149dce77d"},{url:"/_next/static/chunks/5264.c76b2e678a497287.js",revision:"c76b2e678a497287"},{url:"/_next/static/chunks/5318-a62720c3d4324bb4.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/5342.3cf5900e0a5b8f69.js",revision:"3cf5900e0a5b8f69"},{url:"/_next/static/chunks/5452.314084f90c4d7901.js",revision:"314084f90c4d7901"},{url:"/_next/static/chunks/5546.ab86e5d91a535cf4.js",revision:"ab86e5d91a535cf4"},{url:"/_next/static/chunks/5776.34804074927636b4.js",revision:"34804074927636b4"},{url:"/_next/static/chunks/6197.6cfd69cfe3d032cc.js",revision:"6cfd69cfe3d032cc"},{url:"/_next/static/chunks/6208.9b1cc62069dfeba1.js",revision:"9b1cc62069dfeba1"},{url:"/_next/static/chunks/623.6a708327bfa54156.js",revision:"6a708327bfa54156"},{url:"/_next/static/chunks/6717.15a9cd5a2d073fe3.js",revision:"15a9cd5a2d073fe3"},{url:"/_next/static/chunks/7.b1286dd3811815f7.js",revision:"b1286dd3811815f7"},{url:"/_next/static/chunks/7074.6424f40d23fd9365.js",revision:"6424f40d23fd9365"},{url:"/_next/static/chunks/7248.6a964936e9fdb1bc.js",revision:"6a964936e9fdb1bc"},{url:"/_next/static/chunks/7622-538421b6d4fef6c6.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/8093.54934f11f3da813a.js",revision:"54934f11f3da813a"},{url:"/_next/static/chunks/8129.7c7e1f3c6eaa1435.js",revision:"7c7e1f3c6eaa1435"},{url:"/_next/static/chunks/8173-720974092fa5d061.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/8251-2d9742021624bf64.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/8407.347f872e729f5be5.js",revision:"347f872e729f5be5"},{url:"/_next/static/chunks/8467.2a0d0e5403ecd9ea.js",revision:"2a0d0e5403ecd9ea"},{url:"/_next/static/chunks/8838.715a964706ff0004.js",revision:"715a964706ff0004"},{url:"/_next/static/chunks/8925.1883de10d0c9e4cc.js",revision:"1883de10d0c9e4cc"},{url:"/_next/static/chunks/9081a741-d44f478aa637463b.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/9405.c1f5d1c3ad021d41.js",revision:"c1f5d1c3ad021d41"},{url:"/_next/static/chunks/9816-67696f0c01978d2b.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/9854-5f3f3a26a5d719c9.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/%5Bslug%5D/layout-7cbcf7dd1404668a.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/%5Bslug%5D/page-611436e72ba71c42.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/%5Bslug%5D/post/%5Bslug1%5D/page-59ca6f1ef5129df3.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/_not-found/page-9e4104cae718d649.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/feed/explore/page-8405934664b68de6.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/feed/layout-a7657458b6b8d025.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/feed/messages/page-246738618067c68d.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/feed/page-8d6c46f6af5c3c6f.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/feed/profile/%5Bslug%5D/page-5c985fddc04a22b9.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/feed/reels/page-12c3c45443673d59.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/feed/settings/page-001c2fbc44fb5e7d.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/layout-03dc3ab44a499f88.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/leetcode/page-da443548ed104a01.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/login/page-5c9b2c0c33e8bfa0.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/page-8d1531aecfe811de.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/releasenotes/page-efedf68033377870.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/report/page-4931ff071700669b.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/signup/page-8f1ef55110645f64.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/sitemap/page-2b9b63177c3048e4.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/app/tcs/page-ee3d4cd7eaded815.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/bc9c3264-7dade76820774d64.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/bc9e92e6-6cb67635139c55b9.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/c15bf2b0-c5f2ab0c4ce668d5.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/db5416bc-33196e909f18844e.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/fd9d1056-28ed71cfe7716eb3.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/framework-dbde1fe7fb0f4567.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/main-437773ef33e2b1d6.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/main-app-ff09f3aa203bad01.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/pages/_app-00b74eae5e8dab51.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/pages/_error-c72a1f77a3c0be1b.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-0268eba2a1de2913.js",revision:"zSfCGjL3qooAQB7W8Rihw"},{url:"/_next/static/css/67af676c503a713d.css",revision:"67af676c503a713d"},{url:"/_next/static/css/8082fd7cc28aa650.css",revision:"8082fd7cc28aa650"},{url:"/_next/static/css/9bd37396b15dac26.css",revision:"9bd37396b15dac26"},{url:"/_next/static/css/a244f157b38dfab8.css",revision:"a244f157b38dfab8"},{url:"/_next/static/media/05a31a2ca4975f99-s.woff2",revision:"f1b44860c66554b91f3b1c81556f73ca"},{url:"/_next/static/media/32db52a016290167-s.p.ttf",revision:"dba0c688b8d5ee09a1e214aebd5d25e4"},{url:"/_next/static/media/364e202ba21fa6fa-s.p.ttf",revision:"79750b1d82b2558801373d62dd7e5280"},{url:"/_next/static/media/3dbff6fd08cce238-s.p.ttf",revision:"e88ec18827526928e71407a24937825a"},{url:"/_next/static/media/513657b02c5c193f-s.woff2",revision:"c4eb7f37bc4206c901ab08601f21f0f2"},{url:"/_next/static/media/51ed15f9841b9f9d-s.woff2",revision:"bb9d99fb9bbc695be80777ca2c1c2bee"},{url:"/_next/static/media/7eb8b39df1ae2ded-s.p.ttf",revision:"eae9c18cee82a8a1a52e654911f8fe83"},{url:"/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2",revision:"74c3556b9dad12fb76f84af53ba69410"},{url:"/_next/static/media/d6b16ce4a6175f26-s.woff2",revision:"dd930bafc6297347be3213f22cc53d3e"},{url:"/_next/static/media/ec159349637c90ad-s.woff2",revision:"0e89df9522084290e01e4127495fae99"},{url:"/_next/static/media/f84675713043186b-s.p.ttf",revision:"85bb2d0ec4a0da159de42e89089ccc0b"},{url:"/_next/static/media/fd4db3eb5472fc27-s.woff2",revision:"71f3fcaf22131c3368d9ec28ef839831"},{url:"/_next/static/zSfCGjL3qooAQB7W8Rihw/_buildManifest.js",revision:"b222cbf4d8e1f47e27a8925222733e53"},{url:"/_next/static/zSfCGjL3qooAQB7W8Rihw/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/btngif.gif",revision:"ee549ec9cb00e32319b12e517a448734"},{url:"/chatbg/Screenshot 2024-06-01 150049.png",revision:"fbee984a903edae878b446013d2998c1"},{url:"/chatbg/heaven.jpeg",revision:"91b083390c17c94643de91bc10e038b3"},{url:"/chatbg/love.jpeg",revision:"b178149d807f28da0404a10343c5d8ba"},{url:"/chatbg/space.jpg",revision:"49d09e87fc7b0ca7c72638c60f1e80cd"},{url:"/closefullscreen.svg",revision:"2b163563f1e261be5db9699aff32e1fd"},{url:"/fullscreen.svg",revision:"2be8c19702dfcbb6e0a6df1b51526ea0"},{url:"/gta.jpeg",revision:"d4cd58c5f11fe62fb56f507bc8d00942"},{url:"/icon.png",revision:"429169a48c96f6a95cfc2796cf019cf6"},{url:"/icons/add-group.png",revision:"07e14fc57877625d8ce872cf15eef912"},{url:"/icons/add.png",revision:"bf36a55a55172cfdd810ebf5aed4f415"},{url:"/icons/arrow.png",revision:"cfbc6c305c365a84b6aa38fb09de419a"},{url:"/icons/attach.png",revision:"23ab5d0f424d10625e0f0449019e825d"},{url:"/icons/cancel.png",revision:"69c576a945a332d6a8a66b1458448933"},{url:"/icons/category.png",revision:"ea6adac9357e7ea24212b8bd11b00124"},{url:"/icons/check-mark.png",revision:"d2ab6078c3bcadb9142018c6e71831ae"},{url:"/icons/clear.png",revision:"707b12a601c8b0b308c455bb52a0b4cc"},{url:"/icons/close.png",revision:"bf2628e43f68f292fa97d1a51a9b0a73"},{url:"/icons/comment-svgrepo-com.svg",revision:"f843e7cf5701490b3653fa6a6fa9b28c"},{url:"/icons/comment.png",revision:"98766edc248e7de8596c2578ca889fe3"},{url:"/icons/conversation.png",revision:"e63244ba366849096bffe0e592e4bd74"},{url:"/icons/copy.png",revision:"597b96efa2bff71da296eac720de1ec7"},{url:"/icons/delete.png",revision:"94fe9f2bc1c059f27df2bbb19bb708e9"},{url:"/icons/direction.png",revision:"661a4b37922e748267e1fcae84519b58"},{url:"/icons/editing.png",revision:"3705724d0c88aee08c24d058d1bba052"},{url:"/icons/exit.png",revision:"28038e875d2d7478a9a183bc36e95c71"},{url:"/icons/feedsend.png",revision:"f80f870f617e24aacbdb5eaeacdb1599"},{url:"/icons/gif.png",revision:"69034a6297c59c42c3fc409557f1c95e"},{url:"/icons/info.png",revision:"357f3005482c720801955087960fc041"},{url:"/icons/lc.png",revision:"4c34bfd28ab59058da7e14c39ce51302"},{url:"/icons/lcl.jpg",revision:"e375f3afbe458b3160da79de9c0bd8a3"},{url:"/icons/lcl2.png",revision:"4d940ca7206709566daca92fa4db4330"},{url:"/icons/like.png",revision:"193a10dc517a5434d011965a28da2f86"},{url:"/icons/liked.png",revision:"0939ddce8309afd72559436eb0d0b8a3"},{url:"/icons/love.png",revision:"0391118ed35eda3bfa6d2f26cb617c1e"},{url:"/icons/message.svg",revision:"e59236001f99150ea0157e60dde9df2f"},{url:"/icons/mute.png",revision:"a5c7f46fda46b344411052c1507bb016"},{url:"/icons/notification.png",revision:"18a2495ca85b1349d0b23c25f8042a28"},{url:"/icons/notliked.png",revision:"1d301bd8e60da44bdc6f80fdbc7c1a73"},{url:"/icons/price-tag.png",revision:"8a274023df5804b1888b5dadfa7cf1d8"},{url:"/icons/read.png",revision:"2e1ff6451656999119c51cabb679f1e7"},{url:"/icons/readt.png",revision:"e09121e819ea876e9d43177fb8e3503c"},{url:"/icons/reply.png",revision:"eb82f8cfad1b77af43734724d56a8e2a"},{url:"/icons/save.png",revision:"28e3514d97b5243da73e58e617bf94a0"},{url:"/icons/search.png",revision:"30dcd67b885a6a4eec8ad26fd207a1f7"},{url:"/icons/send.png",revision:"9e1b21cc4e41509b98050a708412c78e"},{url:"/icons/setting.png",revision:"b06645d217f95d707c09431bb83feb72"},{url:"/icons/sidebar.png",revision:"c7f29bd5e4c4d6f14f76bbed2ac651a2"},{url:"/icons/sidebar_tenmp.png",revision:"72d1d2978cbeba75ed1a4bef98cb1aab"},{url:"/icons/slidedown.png",revision:"f7af826b30811ac8427493749edadcbb"},{url:"/icons/soundon.png",revision:"a5706847badbaa81aa8a11b14347a39f"},{url:"/icons/supermarket.png",revision:"52ee0ea8c3832866fbdefd671aa40280"},{url:"/icons/video.png",revision:"5229132bda4b3f230bd6e833174ed730"},{url:"/icons/war.png",revision:"4da5c0f021b73a3dc093b4d34b4b6e4f"},{url:"/icons/warning.png",revision:"b1e5c9ef2ea556ec3260a2a727725006"},{url:"/loading.gif",revision:"2225b537a65fa3ccc1950c1db447299a"},{url:"/main/p1.png",revision:"f231c61c899fc4f08d68a4bc455931ff"},{url:"/main/p2.png",revision:"2de64033a306cbc1d9a80b871b5cee24"},{url:"/main/p3.png",revision:"2a07b1f3390affd13fe532c9d95b8226"},{url:"/main/p4.png",revision:"75c69b931588211f82647b24320134b8"},{url:"/manifest.json",revision:"0d4c9fbd4fb1dcf495b7ab972121aa7c"},{url:"/mus512.png",revision:"ab48b9f3b4cd8b355a9c3e4a61755ba7"},{url:"/nature.jpg",revision:"ff516ad0cbad1a5840d08fc344618dff"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/share.png",revision:"89f7def691614353566609adbe174ffb"},{url:"/sounds/in.m4a",revision:"15d23381bdb2786a4e8e8748d18f50f7"},{url:"/sounds/inbox.m4a",revision:"b5ea02e517ecd90084b30b82e61acf20"},{url:"/sounds/inbox.mp3",revision:"eef1a40f4ccb5c8015d3943e697e27bd"},{url:"/sounds/out.m4a",revision:"dd7a05bab1846469544b25e567ca727e"},{url:"/suc.png",revision:"f9b1af8b13136b323269c99bdeb8cae7"},{url:"/swe-worker-5c72df51bb1f6ee0.js",revision:"5a47d90db13bb1309b25bdf7b363570e"},{url:"/thumbnail.png",revision:"fbee984a903edae878b446013d2998c1"},{url:"/vercel.svg",revision:"61c6b19abff40ea7acd577be818f3976"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({response:e})=>e&&"opaqueredirect"===e.type?new Response(e.body,{status:200,statusText:"OK",headers:e.headers}):e}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/\/_next\/static.+\.js$/i,new e.CacheFirst({cacheName:"next-static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4|webm)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:48,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e,url:{pathname:s}})=>!(!e||s.startsWith("/api/auth/callback")||!s.startsWith("/api/"))),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:i})=>"1"===e.headers.get("RSC")&&"1"===e.headers.get("Next-Router-Prefetch")&&i&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc-prefetch",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:i})=>"1"===e.headers.get("RSC")&&i&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:{pathname:e},sameOrigin:s})=>s&&!e.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e})=>!e),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET"),self.__WB_DISABLE_DEV_LOGS=!0}));
