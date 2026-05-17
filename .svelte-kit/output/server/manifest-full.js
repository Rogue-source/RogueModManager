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
		client: {start:"_app/immutable/entry/start.DHFr-uQv.js",app:"_app/immutable/entry/app.te56PveN.js",imports:["_app/immutable/entry/start.DHFr-uQv.js","_app/immutable/chunks/tv_y-ccn.js","_app/immutable/chunks/DJfcuGKO.js","_app/immutable/entry/app.te56PveN.js","_app/immutable/chunks/DJfcuGKO.js","_app/immutable/chunks/CL7GRrhQ.js","_app/immutable/chunks/CvYW6WuQ.js","_app/immutable/chunks/BamQIRsD.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
