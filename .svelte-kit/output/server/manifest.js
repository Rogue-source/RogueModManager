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
		client: {start:"_app/immutable/entry/start.Ckn08_uN.js",app:"_app/immutable/entry/app.Chvb1tQ4.js",imports:["_app/immutable/entry/start.Ckn08_uN.js","_app/immutable/chunks/Ch6qEFPY.js","_app/immutable/chunks/BrTxarDZ.js","_app/immutable/chunks/CxzN0UHE.js","_app/immutable/entry/app.Chvb1tQ4.js","_app/immutable/chunks/BrTxarDZ.js","_app/immutable/chunks/Dp0aRcRE.js","_app/immutable/chunks/CxzN0UHE.js","_app/immutable/chunks/pw6cbixr.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
