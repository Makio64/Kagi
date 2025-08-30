import DashboardHeader from '../../components/layout/DashboardHeader.vue'

export default {
	title: 'Layout/DashboardHeader',
	component: DashboardHeader,
	tags: ['autodocs'],
	argTypes: {
		title: {
			control: 'text',
			description: 'The title displayed in the header'
		},
		userBadge: {
			control: 'text',
			description: 'Optional badge text (e.g., "System Admin", "Mansion Admin")'
		},
		userEmail: {
			control: 'text',
			description: 'User email displayed in the menu button'
		},
		userRole: {
			control: 'text',
			description: 'User role displayed in the mobile menu'
		},
		showLanguageSwitcher: {
			control: 'boolean',
			description: 'Whether to show the language switcher'
		},
		onLogoClick: {
			action: 'logo-clicked',
			description: 'Optional callback when logo is clicked'
		}
	}
}

// Template function for all stories
const Template = (args) => ({
	components: { DashboardHeader },
	setup() {
		return { args }
	},
	template: `
		<div style="min-height: 100vh; background: #f5f5f5;">
			<DashboardHeader v-bind="args" @logout="onLogout" @logo-click="onLogoClick" />
			<div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
				<div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
					<h2 style="margin-top: 0;">Page Content</h2>
					<p>This is where the main dashboard content would appear.</p>
				</div>
			</div>
		</div>
	`,
	methods: {
		onLogout() {
			console.log('Logout clicked')
			alert('Logout clicked')
		},
		onLogoClick() {
			console.log('Logo clicked')
		}
	}
})

// Default story - Resident Dashboard
export const Resident = Template.bind({})
Resident.args = {
	title: 'Dresser Tower',
	userEmail: 'resident@example.com',
	userRole: 'Resident',
	showLanguageSwitcher: false
}
Resident.storyName = 'Resident Dashboard'

// Mansion Admin story
export const MansionAdmin = Template.bind({})
MansionAdmin.args = {
	title: 'Sakura Tower',
	userBadge: 'Mansion Admin',
	userEmail: 'mansion.admin@example.com',
	userRole: 'Mansion Administrator',
	showLanguageSwitcher: false
}
MansionAdmin.storyName = 'Mansion Admin Dashboard'

// System Admin story
export const SystemAdmin = Template.bind({})
SystemAdmin.args = {
	title: 'Admin Console',
	userBadge: 'System Admin',
	userEmail: 'admin@kagi.com',
	userRole: 'System Administrator',
	showLanguageSwitcher: true
}
SystemAdmin.storyName = 'System Admin Dashboard'

// Long email story
export const LongEmail = Template.bind({})
LongEmail.args = {
	title: 'Test Building',
	userBadge: 'Test User',
	userEmail: 'very.long.email.address@example-company.co.jp',
	userRole: 'Test Role',
	showLanguageSwitcher: true
}
LongEmail.storyName = 'With Long Email'

// Mobile view story
export const Mobile = Template.bind({})
Mobile.args = {
	title: 'Mobile View',
	userBadge: 'Admin',
	userEmail: 'mobile@example.com',
	userRole: 'Mobile Administrator',
	showLanguageSwitcher: true
}
Mobile.parameters = {
	viewport: {
		defaultViewport: 'iphone12'
	}
}
Mobile.storyName = 'Mobile View'

// With click handler
export const WithClickHandler = Template.bind({})
WithClickHandler.args = {
	title: 'Clickable Logo',
	userEmail: 'user@example.com',
	userRole: 'User',
	showLanguageSwitcher: false,
	onLogoClick: () => {
		alert('Logo clicked! This could navigate to home page.')
	}
}
WithClickHandler.storyName = 'With Logo Click Handler'