if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,c)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let t={};const r=e=>i(e,a),d={module:{uri:a},exports:t,require:r};s[a]=Promise.all(n.map((e=>d[e]||r(e)))).then((e=>(c(...e),t)))}}define(["./workbox-f1770938"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/192.png",revision:"dd433d3be632fb54975ad0fd7c335dc2"},{url:"/384.png",revision:"6e33b25becfe4d62fdd5bea74ac922df"},{url:"/Product Sans Bold Italic.ttf",revision:"79750b1d82b2558801373d62dd7e5280"},{url:"/Product Sans Bold.ttf",revision:"dba0c688b8d5ee09a1e214aebd5d25e4"},{url:"/Product Sans Italic.ttf",revision:"e88ec18827526928e71407a24937825a"},{url:"/Product Sans Regular.ttf",revision:"eae9c18cee82a8a1a52e654911f8fe83"},{url:"/RethinkSans-ExtraBold.ttf",revision:"1b413f9e634e69348afdb88e660289d4"},{url:"/RethinkSans-ExtraBoldItalic.ttf",revision:"9cb729629762dd43fea57f0b8e8ce2a8"},{url:"/RethinkSans-Italic-VariableFont_wght.ttf",revision:"f60b50f3dc35b5637a5e34b7e483ae70"},{url:"/RethinkSans-Medium.ttf",revision:"64f2b59cad6990c62932a0403f7afb5d"},{url:"/RethinkSans-MediumItalic.ttf",revision:"7827aa720ad5a8c3475e252d2375fd6e"},{url:"/RethinkSans-SemiBold.ttf",revision:"f58a785990f1f1d12b1518ffc5340e71"},{url:"/RethinkSans-SemiBoldItalic.ttf",revision:"808bb87be9ccc78ce833a7f3a92f10f7"},{url:"/Stars.jpg",revision:"a97dcfa1a2d604286f61c7cae6a48690"},{url:"/_next/static/chunks/1058.91617c77c47313b3.js",revision:"91617c77c47313b3"},{url:"/_next/static/chunks/1062-0157e9832986a7e9.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/1419-572f9624b2f7c782.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/1449-653223ddfa899a74.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/2107-3dabf396cb286ac0.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/2123.40527425624bd507.js",revision:"40527425624bd507"},{url:"/_next/static/chunks/2170.8fa2d04339e85652.js",revision:"8fa2d04339e85652"},{url:"/_next/static/chunks/231-3cae232db18cf7e7.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/2614-6c6256b1a5e1d26f.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/2769.8fbe21b94b55d10b.js",revision:"8fbe21b94b55d10b"},{url:"/_next/static/chunks/2924.51b3be702b2b7ecf.js",revision:"51b3be702b2b7ecf"},{url:"/_next/static/chunks/2960.6277be0b07e5cf0b.js",revision:"6277be0b07e5cf0b"},{url:"/_next/static/chunks/2973-5a2a0293b326fe7d.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/3363-afb857a0b0a6c106.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/3511.820d6e8a0945269d.js",revision:"820d6e8a0945269d"},{url:"/_next/static/chunks/3741.bc3e187728d06ad2.js",revision:"bc3e187728d06ad2"},{url:"/_next/static/chunks/39209d7c-bc80f538f3ddb5fa.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/4144.947cdc93fb0031fc.js",revision:"947cdc93fb0031fc"},{url:"/_next/static/chunks/4412.17229e49b154cc30.js",revision:"17229e49b154cc30"},{url:"/_next/static/chunks/472688b4.57a4f7a0db090898.js",revision:"57a4f7a0db090898"},{url:"/_next/static/chunks/4899-d0dea8dadbc514be.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/4962-5d18a7ab2796b2ff.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/506-02cb5be75a35e097.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/5080.117dfb08f7e3d07b.js",revision:"117dfb08f7e3d07b"},{url:"/_next/static/chunks/5190-dac65e53ff99b093.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/5197.487be4c292a9bd49.js",revision:"487be4c292a9bd49"},{url:"/_next/static/chunks/5218.e46cf84218c3b25c.js",revision:"e46cf84218c3b25c"},{url:"/_next/static/chunks/5264.c54ff7dfe26c2188.js",revision:"c54ff7dfe26c2188"},{url:"/_next/static/chunks/5318-f9d304fd93d2fadc.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/5342.6177fb713388130d.js",revision:"6177fb713388130d"},{url:"/_next/static/chunks/5452.ff79fb109a1bf8c3.js",revision:"ff79fb109a1bf8c3"},{url:"/_next/static/chunks/5546.9031b2f90c8ec2f0.js",revision:"9031b2f90c8ec2f0"},{url:"/_next/static/chunks/5776.422cdcc694094511.js",revision:"422cdcc694094511"},{url:"/_next/static/chunks/6197.773bba3076c758bc.js",revision:"773bba3076c758bc"},{url:"/_next/static/chunks/6208.60860b07468da4d0.js",revision:"60860b07468da4d0"},{url:"/_next/static/chunks/6717.0b399a75167295c9.js",revision:"0b399a75167295c9"},{url:"/_next/static/chunks/7.ffb51624d9877f11.js",revision:"ffb51624d9877f11"},{url:"/_next/static/chunks/7074.5b287e851e598602.js",revision:"5b287e851e598602"},{url:"/_next/static/chunks/7138.f089cc9838013ab9.js",revision:"f089cc9838013ab9"},{url:"/_next/static/chunks/7248.5fca38f11bd77c72.js",revision:"5fca38f11bd77c72"},{url:"/_next/static/chunks/7622-702fb0f5b356630c.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/8093.e260ca0e104a654c.js",revision:"e260ca0e104a654c"},{url:"/_next/static/chunks/8129.9e87528549775cc3.js",revision:"9e87528549775cc3"},{url:"/_next/static/chunks/8173-a390269bc07644a0.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/8251-6d7c9a04bdf5f3e2.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/8407.9279b521d2b97e59.js",revision:"9279b521d2b97e59"},{url:"/_next/static/chunks/8467.4e92329980d0cf02.js",revision:"4e92329980d0cf02"},{url:"/_next/static/chunks/8838.d0a325d5953b0bf6.js",revision:"d0a325d5953b0bf6"},{url:"/_next/static/chunks/8925.8b570351fe69957e.js",revision:"8b570351fe69957e"},{url:"/_next/static/chunks/9081a741-9b1a65e962b52107.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/9405.76a23560d2fe7ca6.js",revision:"76a23560d2fe7ca6"},{url:"/_next/static/chunks/9816-ab40ca55d0017694.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/9854-f3f3ac21b1db68f1.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/9875.5befe8778d7ee5b9.js",revision:"5befe8778d7ee5b9"},{url:"/_next/static/chunks/app/%5Bslug%5D/layout-7feccd52bd3e4a09.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/%5Bslug%5D/page-3a7049ed6e68506c.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/%5Bslug%5D/post/%5Bslug1%5D/page-5b3a54b803a2088b.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/_not-found/page-7e9928d98dc15da7.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/feed/explore/page-16c1dc096606910f.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/feed/layout-8a7e2d3e16ca91d9.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/feed/messages/page-a0e57c5428817b29.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/feed/page-541e2cb3178bb545.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/feed/profile/%5Bslug%5D/page-0d39062ff9289bc7.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/feed/reels/page-b1b1b094736e23ef.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/feed/settings/page-4fd937cff1ab3f46.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/layout-986d0e7bd01cdbe1.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/leetcode/page-c744889b4ab273a0.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/login/page-b80c4a3964abda32.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/page-df4aa3eff84ed9a2.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/releasenotes/page-b01dd2d2ea555bff.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/report/page-048a14ed4e8db195.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/signup/page-8004d5dd3ffb45ff.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/sitemap/page-ac314def65dd22ae.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/app/tcs/page-67543a75ca5bc3d9.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/bc9c3264-cbcb53286dbc0333.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/bc9e92e6-871fa84490d58f3d.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/c15bf2b0-77a7fe2edf0e5bbc.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/db5416bc-90836020af30b21f.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/fd9d1056-a1c9224436e1da1b.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/framework-56dfd39ab9a08705.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/main-6b79f5934687c09a.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/main-app-69398d0d1b8547ff.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/pages/_app-f870474a17b7f2fd.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-0e397468533676ec.js",revision:"pOFdUYQU5B2in9OI6_eue"},{url:"/_next/static/css/8082fd7cc28aa650.css",revision:"8082fd7cc28aa650"},{url:"/_next/static/css/9bd37396b15dac26.css",revision:"9bd37396b15dac26"},{url:"/_next/static/css/a00dec0fda0b513a.css",revision:"a00dec0fda0b513a"},{url:"/_next/static/css/a244f157b38dfab8.css",revision:"a244f157b38dfab8"},{url:"/_next/static/media/05a31a2ca4975f99-s.woff2",revision:"f1b44860c66554b91f3b1c81556f73ca"},{url:"/_next/static/media/32db52a016290167-s.p.ttf",revision:"dba0c688b8d5ee09a1e214aebd5d25e4"},{url:"/_next/static/media/364e202ba21fa6fa-s.p.ttf",revision:"79750b1d82b2558801373d62dd7e5280"},{url:"/_next/static/media/3dbff6fd08cce238-s.p.ttf",revision:"e88ec18827526928e71407a24937825a"},{url:"/_next/static/media/513657b02c5c193f-s.woff2",revision:"c4eb7f37bc4206c901ab08601f21f0f2"},{url:"/_next/static/media/51ed15f9841b9f9d-s.woff2",revision:"bb9d99fb9bbc695be80777ca2c1c2bee"},{url:"/_next/static/media/7eb8b39df1ae2ded-s.p.ttf",revision:"eae9c18cee82a8a1a52e654911f8fe83"},{url:"/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2",revision:"74c3556b9dad12fb76f84af53ba69410"},{url:"/_next/static/media/d6b16ce4a6175f26-s.woff2",revision:"dd930bafc6297347be3213f22cc53d3e"},{url:"/_next/static/media/ec159349637c90ad-s.woff2",revision:"0e89df9522084290e01e4127495fae99"},{url:"/_next/static/media/f84675713043186b-s.p.ttf",revision:"85bb2d0ec4a0da159de42e89089ccc0b"},{url:"/_next/static/media/fd4db3eb5472fc27-s.woff2",revision:"71f3fcaf22131c3368d9ec28ef839831"},{url:"/_next/static/pOFdUYQU5B2in9OI6_eue/_buildManifest.js",revision:"3e2d62a10f4d6bf0b92e14aecf7836f4"},{url:"/_next/static/pOFdUYQU5B2in9OI6_eue/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/btngif.gif",revision:"ee549ec9cb00e32319b12e517a448734"},{url:"/chatbg/Screenshot 2024-06-01 150049.png",revision:"fbee984a903edae878b446013d2998c1"},{url:"/chatbg/heaven.jpeg",revision:"91b083390c17c94643de91bc10e038b3"},{url:"/chatbg/love.jpeg",revision:"b178149d807f28da0404a10343c5d8ba"},{url:"/chatbg/space.jpg",revision:"49d09e87fc7b0ca7c72638c60f1e80cd"},{url:"/closefullscreen.svg",revision:"2b163563f1e261be5db9699aff32e1fd"},{url:"/fullscreen.svg",revision:"2be8c19702dfcbb6e0a6df1b51526ea0"},{url:"/gta.jpeg",revision:"d4cd58c5f11fe62fb56f507bc8d00942"},{url:"/icon.png",revision:"429169a48c96f6a95cfc2796cf019cf6"},{url:"/icons/add-group.png",revision:"07e14fc57877625d8ce872cf15eef912"},{url:"/icons/add.png",revision:"bf36a55a55172cfdd810ebf5aed4f415"},{url:"/icons/arrow.png",revision:"cfbc6c305c365a84b6aa38fb09de419a"},{url:"/icons/attach.png",revision:"23ab5d0f424d10625e0f0449019e825d"},{url:"/icons/badge.png",revision:"0a01e19366d2f79fdf7e5c00cd5f1bfb"},{url:"/icons/cancel.png",revision:"69c576a945a332d6a8a66b1458448933"},{url:"/icons/category.png",revision:"ea6adac9357e7ea24212b8bd11b00124"},{url:"/icons/check-mark.png",revision:"d2ab6078c3bcadb9142018c6e71831ae"},{url:"/icons/clear.png",revision:"707b12a601c8b0b308c455bb52a0b4cc"},{url:"/icons/close.png",revision:"bf2628e43f68f292fa97d1a51a9b0a73"},{url:"/icons/comment-svgrepo-com.svg",revision:"f843e7cf5701490b3653fa6a6fa9b28c"},{url:"/icons/comment.png",revision:"98766edc248e7de8596c2578ca889fe3"},{url:"/icons/conversation.png",revision:"e63244ba366849096bffe0e592e4bd74"},{url:"/icons/copy.png",revision:"597b96efa2bff71da296eac720de1ec7"},{url:"/icons/delete.png",revision:"94fe9f2bc1c059f27df2bbb19bb708e9"},{url:"/icons/direction.png",revision:"661a4b37922e748267e1fcae84519b58"},{url:"/icons/editing.png",revision:"3705724d0c88aee08c24d058d1bba052"},{url:"/icons/exit.png",revision:"28038e875d2d7478a9a183bc36e95c71"},{url:"/icons/feedsend.png",revision:"f80f870f617e24aacbdb5eaeacdb1599"},{url:"/icons/gif.png",revision:"69034a6297c59c42c3fc409557f1c95e"},{url:"/icons/info.png",revision:"357f3005482c720801955087960fc041"},{url:"/icons/lc.png",revision:"4c34bfd28ab59058da7e14c39ce51302"},{url:"/icons/lcl.jpg",revision:"e375f3afbe458b3160da79de9c0bd8a3"},{url:"/icons/lcl2.png",revision:"4d940ca7206709566daca92fa4db4330"},{url:"/icons/like.png",revision:"193a10dc517a5434d011965a28da2f86"},{url:"/icons/liked.png",revision:"0939ddce8309afd72559436eb0d0b8a3"},{url:"/icons/love.png",revision:"0391118ed35eda3bfa6d2f26cb617c1e"},{url:"/icons/message.svg",revision:"e59236001f99150ea0157e60dde9df2f"},{url:"/icons/mute.png",revision:"a5c7f46fda46b344411052c1507bb016"},{url:"/icons/notification.png",revision:"18a2495ca85b1349d0b23c25f8042a28"},{url:"/icons/notliked.png",revision:"1d301bd8e60da44bdc6f80fdbc7c1a73"},{url:"/icons/price-tag.png",revision:"8a274023df5804b1888b5dadfa7cf1d8"},{url:"/icons/read.png",revision:"2e1ff6451656999119c51cabb679f1e7"},{url:"/icons/readt.png",revision:"e09121e819ea876e9d43177fb8e3503c"},{url:"/icons/reply.png",revision:"eb82f8cfad1b77af43734724d56a8e2a"},{url:"/icons/save.png",revision:"28e3514d97b5243da73e58e617bf94a0"},{url:"/icons/search.png",revision:"30dcd67b885a6a4eec8ad26fd207a1f7"},{url:"/icons/send.png",revision:"9e1b21cc4e41509b98050a708412c78e"},{url:"/icons/setting.png",revision:"b06645d217f95d707c09431bb83feb72"},{url:"/icons/sidebar.png",revision:"c7f29bd5e4c4d6f14f76bbed2ac651a2"},{url:"/icons/sidebar_tenmp.png",revision:"72d1d2978cbeba75ed1a4bef98cb1aab"},{url:"/icons/slidedown.png",revision:"f7af826b30811ac8427493749edadcbb"},{url:"/icons/soundon.png",revision:"a5706847badbaa81aa8a11b14347a39f"},{url:"/icons/supermarket.png",revision:"52ee0ea8c3832866fbdefd671aa40280"},{url:"/icons/trending.png",revision:"07846c51b14e93d0fb6cbcb021dacb13"},{url:"/icons/video.png",revision:"5229132bda4b3f230bd6e833174ed730"},{url:"/icons/war.png",revision:"4da5c0f021b73a3dc093b4d34b4b6e4f"},{url:"/icons/warning.png",revision:"b1e5c9ef2ea556ec3260a2a727725006"},{url:"/loading.gif",revision:"2225b537a65fa3ccc1950c1db447299a"},{url:"/main/p1.png",revision:"f231c61c899fc4f08d68a4bc455931ff"},{url:"/main/p2.png",revision:"2de64033a306cbc1d9a80b871b5cee24"},{url:"/main/p3.png",revision:"2a07b1f3390affd13fe532c9d95b8226"},{url:"/main/p4.png",revision:"75c69b931588211f82647b24320134b8"},{url:"/manifest.json",revision:"0d4c9fbd4fb1dcf495b7ab972121aa7c"},{url:"/mus512.png",revision:"ab48b9f3b4cd8b355a9c3e4a61755ba7"},{url:"/nature.jpg",revision:"ff516ad0cbad1a5840d08fc344618dff"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/share.png",revision:"89f7def691614353566609adbe174ffb"},{url:"/sounds/in.m4a",revision:"15d23381bdb2786a4e8e8748d18f50f7"},{url:"/sounds/inbox.mp3",revision:"eef1a40f4ccb5c8015d3943e697e27bd"},{url:"/sounds/notificationsound.wav",revision:"d6b9ae6db003d83cac34fbdaed62a05b"},{url:"/sounds/out.m4a",revision:"dd7a05bab1846469544b25e567ca727e"},{url:"/suc.png",revision:"f9b1af8b13136b323269c99bdeb8cae7"},{url:"/swe-worker-5c72df51bb1f6ee0.js",revision:"5a47d90db13bb1309b25bdf7b363570e"},{url:"/thumbnail.png",revision:"fbee984a903edae878b446013d2998c1"},{url:"/vercel.svg",revision:"61c6b19abff40ea7acd577be818f3976"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({response:e})=>e&&"opaqueredirect"===e.type?new Response(e.body,{status:200,statusText:"OK",headers:e.headers}):e}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/\/_next\/static.+\.js$/i,new e.CacheFirst({cacheName:"next-static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4|webm)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:48,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e,url:{pathname:s}})=>!(!e||s.startsWith("/api/auth/callback")||!s.startsWith("/api/"))),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:i})=>"1"===e.headers.get("RSC")&&"1"===e.headers.get("Next-Router-Prefetch")&&i&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc-prefetch",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:i})=>"1"===e.headers.get("RSC")&&i&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:{pathname:e},sameOrigin:s})=>s&&!e.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e})=>!e),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET"),self.__WB_DISABLE_DEV_LOGS=!0}));
