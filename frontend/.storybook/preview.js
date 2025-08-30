/** @type { import('@storybook/vue3').Preview } */

// Import global styles
import '../src/styles/tokens.styl'

// Import the font loading utility if custom fonts need to be loaded dynamically
// Uncomment if you want to use the dynamic font loader instead of preview-head.html
// import loadFonts from '../src/makio/utils/injectFonts'

// Mock translation plugin
const mockTranslations = {
	'common.save': 'Save',
	'common.cancel': 'Cancel',
	'common.edit': 'Edit',
	'common.delete': 'Delete',
	'common.close': 'Close',
	'common.settings': 'Settings',
	'nav.logout': 'Logout',
	'dashboard.welcome': 'Welcome to Kagi',
	'dashboard.welcomeSubtitle': 'Your building management portal'
}

const preview = {
	parameters: {
		actions: { argTypesRegex: '^on[A-Z].*' },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		backgrounds: {
			default: 'light',
			values: [
				{
					name: 'light',
					value: '#F9F9F9'
				},
				{
					name: 'white',
					value: '#FFFFFF'
				},
				{
					name: 'dark',
					value: '#333333'
				}
			]
		},
		viewport: {
			viewports: {
				mobile: {
					name: 'Mobile',
					styles: {
						width: '375px',
						height: '667px'
					}
				},
				tablet: {
					name: 'Tablet',
					styles: {
						width: '768px',
						height: '1024px'
					}
				},
				desktop: {
					name: 'Desktop',
					styles: {
						width: '1440px',
						height: '900px'
					}
				}
			}
		}
	},
	decorators: [
		( story ) => ( {
			setup() {
				// Provide mock translation function
				const $t = ( key ) => mockTranslations[key] || key
				
				// Optional: Load fonts dynamically if not using preview-head.html
				// onMounted(() => {
				//   loadFonts([
				//     { name: 'BlackHanSans', url: '/fonts/subset-BlackHanSans-Regular', weight: 400 }
				//   ])
				// })
				
				return { $t }
			},
			template: '<div style="padding: 20px; font-family: var(--font-family);"><story /></div>'
		} )
	],
	globalTypes: {
		locale: {
			name: 'Locale',
			description: 'Language for components',
			defaultValue: 'en',
			toolbar: {
				icon: 'globe',
				items: [
					{ value: 'en', title: 'English' },
					{ value: 'fr', title: 'Français' },
					{ value: 'ja', title: '日本語' }
				]
			}
		}
	}
}

export default preview