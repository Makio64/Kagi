import { join } from 'path'

/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
	stories: [
		'../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
		'../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)'
	],
	// Simplified addons to avoid version conflicts
	addons: [],
	framework: {
		name: '@storybook/vue3-vite',
		options: {}
	},
	viteFinal: async ( config ) => {
		// Add Stylus support
		config.css = {
			...config.css,
			preprocessorOptions: {
				stylus: {
					additionalData: `@import "${join( __dirname, '../src/styles/tokens.styl' )}"`
				}
			}
		}
		
		// Add auto-import support
		config.resolve = {
			...config.resolve,
			alias: {
				...config.resolve.alias,
				'@': join( __dirname, '../src' )
			}
		}
		
		return config
	}
}

export default config