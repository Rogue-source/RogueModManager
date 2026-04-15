export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","svelte.svg","tauri.svg","vite.svg"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.Dkpl4Xhw.js",app:"_app/immutable/entry/app.Cjf_P9AV.js",imports:["_app/immutable/entry/start.Dkpl4Xhw.js","_app/immutable/chunks/pXKLwxUf.js","_app/immutable/chunks/D_in7knP.js","_app/immutable/entry/app.Cjf_P9AV.js","_app/immutable/chunks/D_in7knP.js","_app/immutable/chunks/D1Ydh055.js","_app/immutable/chunks/3NnCGJUs.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/mods",
				pattern: /^\/mods\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
