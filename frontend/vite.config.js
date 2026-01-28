import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import cssnano from 'cssnano'
import AutoImport from 'unplugin-auto-import/vite'
// Allow to auto import the components, making the code much more clean and light
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { brotliSizePlugin } from 'vite-plugin-brotli-size'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import mkcert from 'vite-plugin-mkcert'
import { qrcode } from 'vite-plugin-qrcode'
import tslOperatorPlugin from 'vite-plugin-tsl-operator'

const configDir = path.dirname( fileURLToPath( new URL( './vite.config.js', import.meta.url ) ) )

const isProd = process.env.NODE_ENV === 'production'

// https://vitejs.dev/config/
export default defineConfig( {
	plugins: [
		vue(),
		// Force-resolve alias '@/...' and '@' in case alias config is ignored in some environments
		{
			name: 'resolve-at-alias',
			enforce: 'pre',
			resolveId( source ) {
				if ( source === '@' ) {
					return fileURLToPath( new URL( './src', import.meta.url ) )
				}
				if ( source.startsWith( '@/' ) ) {
					return fileURLToPath( new URL( `./src/${ source.slice( 2 ) }`, import.meta.url ) )
				}
				return null
			}
		},
		...( !isProd ? [mkcert()] : [] ),
		cssInjectedByJsPlugin(),
		tslOperatorPlugin( { logs: true } ),
		Components( {
			/* options https://github.com/antfu/unplugin-vue-components */
			deep: true,
			directives: false,
		} ),
		AutoImport( {
			/* options https://github.com/antfu/unplugin-auto-import */
			include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
			imports: ['vue', 'vue-router'],
			vueTemplate: true,
			eslintrc: {
				enabled: true,
			},
		} ),
		qrcode(),
		// network, sunburst, treemap, icicle
		// visualizer( { open: true, brotliSize: true, template: 'sunburst', emitFile: false, sourcemap: true } ),
		brotliSizePlugin(),
	],
	build: {
		target: 'esnext',
		emptyOutDir: true,
		sourcemap: false,
		cssCodeSplit: false,
		// Enable minification for all file types
		minify: 'terser', // Use terser for better JS minification
		cssMinify: 'esbuild', // Fast CSS minification
		terserOptions: {
			compress: {
				drop_console: true, // Remove console.log statements
				drop_debugger: true, // Remove debugger statements
				pure_funcs: ['console.log', 'console.warn'], // Remove specific function calls
				passes: 2, // Multiple passes for better compression
			},
			mangle: {
				toplevel: true, // Mangle variable names at top level
			},
			format: {
				comments: false, // Remove all comments
			},
		},
		rollupOptions: {
			output: {
				manualChunks: undefined,
				// Additional compression for output
				compact: true,
			},
		},
	},
	esbuild: {
		keepNames: false,
		legalComments: 'none',
		// Additional esbuild minification options
		minifyIdentifiers: true,
		minifySyntax: true,
		minifyWhitespace: true,
		treeShaking: true,
	},

	optimizeDeps: {
		esbuildOptions: {
			target: 'esnext', // Ensure esbuild target is set to esnext for dependencies
		},
	},
	css: {
		preprocessorOptions: {
			stylus: {
				imports: [fileURLToPath( new URL( './src/css/global.styl', import.meta.url ) )],
			},
		},
		// Force CSS to be inlined
		modules: false,
		devSourcemap: true,
		// Additional CSS minification options
		postcss: {
			plugins: process.env.NODE_ENV === 'production' ? [
				cssnano( {
					preset: [
						'default', {
							discardComments: { removeAll: true },
							normalizeWhitespace: true,
							colormin: true,
							convertValues: true,
							discardDuplicates: true,
							discardEmpty: true,
							mergeRules: true,
							minifySelectors: true,
						}
					]
				} )
			] : [],
		},
	},
	// HTML minification (handled by Vite's built-in HTML processing)
	html: {
		cspNonce: false,
		minify: process.env.NODE_ENV === 'production' ? {
			removeComments: true,
			collapseWhitespace: true,
			removeRedundantAttributes: true,
			useShortDoctype: true,
			removeEmptyAttributes: true,
			removeStyleLinkTypeAttributes: true,
			keepClosingSlash: true,
			minifyJS: true,
			minifyCSS: true,
			minifyURLs: true,
		} : false,
	},
	base: './', // Relative path for mobile apps
	resolve: {
		alias: [
			{ find: '@', replacement: path.resolve( configDir, 'src' ) },
			{ find: '@/', replacement: path.resolve( configDir, 'src' ) + '/' },
			{ find: /^@\//, replacement: path.resolve( configDir, 'src' ) + '/' }
		],
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.styl'],
	},
	server: {
		https: true,
		watch: {
			ignored: ['**/nodejs-tools/**'],
		},
		port: 3000,
		strictPort: false
	},
	test: {
		globals: true,
		environment: 'happy-dom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['node_modules', 'dist'],
		setupFiles: ['./src/tests/setup.js'],
		env: {
			VITE_SUPABASE_URL: 'https://test.supabase.co',
			VITE_SUPABASE_ANON_KEY: 'test-anon-key'
		}
	},
} )
