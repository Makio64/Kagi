import KCard from '../core/KCard.vue'
import SectionHeader from '../dashboard/SectionHeader.vue'
import StatCard from '../dashboard/StatCard.vue'
import DashboardLayout from './DashboardLayout.vue'

export default {
	title: 'Layout/DashboardLayout',
	component: DashboardLayout,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen'
	},
	argTypes: {
		userType: {
			control: 'select',
			options: ['resident', 'admin', 'mansion'],
			description: 'Type of user dashboard'
		},
		userName: {
			control: 'text',
			description: 'Name of the logged-in user'
		},
		userBuilding: {
			control: 'text',
			description: 'Building name for resident users'
		}
	}
}

// Resident dashboard
export const ResidentDashboard = {
	args: {
		userType: 'resident',
		userName: 'John Doe',
		userBuilding: 'Sakura Tower'
	},
	render: ( args ) => ( {
		components: { DashboardLayout, KCard, StatCard },
		setup() {
			return { args }
		},
		template: `
			<DashboardLayout v-bind="args">
				<div style="padding: 24px;">
					<h1 style="margin-bottom: 24px;">Welcome back, {{ args.userName }}!</h1>
					
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px;">
						<StatCard
							icon="📋"
							label="Open Requests"
							:value="3"
							variant="warning"
						/>
						<StatCard
							icon="💳"
							label="Next Payment"
							:value="125000"
							format="currency"
							subtext="Due in 5 days"
						/>
						<StatCard
							icon="📅"
							label="Bookings"
							:value="2"
							variant="info"
						/>
					</div>
					
					<h2 style="margin-bottom: 16px;">Quick Actions</h2>
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
						<KCard
							icon="🔧"
							title="Maintenance"
							description="Request repairs"
							clickable
							variant="primary"
						/>
						<KCard
							icon="📅"
							title="Book Facility"
							description="Reserve amenities"
							clickable
						/>
						<KCard
							icon="💳"
							title="Pay Bills"
							description="View payments"
							clickable
						/>
					</div>
				</div>
			</DashboardLayout>
		`
	} )
}

// Admin dashboard
export const AdminDashboard = {
	args: {
		userType: 'admin',
		userName: 'Admin User'
	},
	render: ( args ) => ( {
		components: { DashboardLayout, StatCard, SectionHeader, KCard },
		setup() {
			return { args }
		},
		template: `
			<DashboardLayout v-bind="args">
				<div style="padding: 24px;">
					<SectionHeader 
						title="Management Overview" 
						icon="📊"
					/>
					
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 24px 0;">
						<StatCard
							icon="🏢"
							label="Buildings"
							:value="12"
							variant="primary"
							:trend="{ text: '+2 this month', positive: true }"
						/>
						<StatCard
							icon="👥"
							label="Total Residents"
							:value="1248"
							variant="secondary"
							:trend="{ text: '+48 this month', positive: true }"
						/>
						<StatCard
							icon="🔧"
							label="Open Requests"
							:value="23"
							variant="warning"
							:trend="{ text: '8 urgent', positive: false }"
						/>
						<StatCard
							icon="💰"
							label="Monthly Revenue"
							:value="12500000"
							format="currency"
							variant="success"
							:trend="{ text: '+12%', positive: true }"
						/>
					</div>
					
					<SectionHeader 
						title="Recent Buildings" 
						icon="🏢"
						searchable
					/>
					
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 16px;">
						<KCard
							icon="🏢"
							title="Sakura Tower"
							variant="primary"
						>
							<div style="display: grid; gap: 8px;">
								<div style="display: flex; justify-content: space-between;">
									<span style="color: #666;">Units:</span>
									<span>120</span>
								</div>
								<div style="display: flex; justify-content: space-between;">
									<span style="color: #666;">Occupancy:</span>
									<span style="color: #4CAF50;">95%</span>
								</div>
							</div>
						</KCard>
						<KCard
							icon="🏢"
							title="Green Valley"
						>
							<div style="display: grid; gap: 8px;">
								<div style="display: flex; justify-content: space-between;">
									<span style="color: #666;">Units:</span>
									<span>80</span>
								</div>
								<div style="display: flex; justify-content: space-between;">
									<span style="color: #666;">Occupancy:</span>
									<span style="color: #4CAF50;">92%</span>
								</div>
							</div>
						</KCard>
					</div>
				</div>
			</DashboardLayout>
		`
	} )
}

// Mansion admin dashboard
export const MansionDashboard = {
	args: {
		userType: 'mansion',
		userName: 'Building Manager',
		userBuilding: 'Sakura Tower'
	},
	render: ( args ) => ( {
		components: { DashboardLayout, StatCard, SectionHeader, KCard },
		setup() {
			return { args }
		},
		template: `
			<DashboardLayout v-bind="args">
				<div style="padding: 24px;">
					<SectionHeader 
						title="Sakura Tower Dashboard" 
						subtitle="Building Management Portal"
						icon="🏢"
					/>
					
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 24px 0;">
						<StatCard
							icon="👥"
							label="Residents"
							:value="114"
							variant="primary"
						/>
						<StatCard
							icon="🏠"
							label="Occupancy"
							:value="95"
							format="percent"
							variant="success"
							:trend="{ text: '+2%', positive: true }"
						/>
						<StatCard
							icon="🔧"
							label="Maintenance"
							:value="8"
							variant="warning"
							:badge="{ text: '3 URGENT', variant: 'danger' }"
						/>
						<StatCard
							icon="💰"
							label="Monthly Revenue"
							:value="5000000"
							format="currency"
							variant="info"
						/>
					</div>
					
					<SectionHeader 
						title="Recent Residents" 
						icon="👥"
						searchable
						searchPlaceholder="Search residents..."
					/>
					
					<div style="display: grid; gap: 12px; margin-top: 16px;">
						<KCard outlined>
							<div style="display: flex; justify-content: space-between; align-items: center;">
								<div>
									<strong>John Doe</strong>
									<div style="color: #666; font-size: 14px;">Unit 502 • Joined Jan 2024</div>
								</div>
								<span style="padding: 4px 12px; background: #E8F5E9; color: #4CAF50; border-radius: 12px; font-size: 12px;">ACTIVE</span>
							</div>
						</KCard>
						<KCard outlined>
							<div style="display: flex; justify-content: space-between; align-items: center;">
								<div>
									<strong>Jane Smith</strong>
									<div style="color: #666; font-size: 14px;">Unit 301 • Joined Feb 2024</div>
								</div>
								<span style="padding: 4px 12px; background: #E8F5E9; color: #4CAF50; border-radius: 12px; font-size: 12px;">ACTIVE</span>
							</div>
						</KCard>
					</div>
				</div>
			</DashboardLayout>
		`
	} )
}

// Mobile view
export const MobileView = {
	parameters: {
		viewport: {
			defaultViewport: 'mobile'
		}
	},
	args: {
		userType: 'resident',
		userName: 'John Doe',
		userBuilding: 'Sakura Tower'
	},
	render: ( args ) => ( {
		components: { DashboardLayout, KCard },
		setup() {
			return { args }
		},
		template: `
			<DashboardLayout v-bind="args">
				<div style="padding: 16px;">
					<h2 style="margin-bottom: 16px;">Welcome back!</h2>
					<div style="display: grid; gap: 12px;">
						<KCard
							icon="🔧"
							title="Maintenance"
							description="Request repairs"
							clickable
							variant="primary"
							size="sm"
						/>
						<KCard
							icon="📅"
							title="Book Facility"
							description="Reserve amenities"
							clickable
							size="sm"
						/>
						<KCard
							icon="💳"
							title="Pay Bills"
							description="View payments"
							clickable
							size="sm"
						/>
					</div>
				</div>
			</DashboardLayout>
		`
	} )
}

// With custom navigation
export const CustomNavigation = {
	args: {
		userType: 'admin',
		userName: 'Admin User'
	},
	render: ( args ) => ( {
		components: { DashboardLayout },
		setup() {
			const customNavItems = [
				{ icon: '📊', label: 'Analytics', path: '/analytics' },
				{ icon: '📈', label: 'Reports', path: '/reports' },
				{ icon: '🔔', label: 'Alerts', path: '/alerts', badge: '5' },
				{ icon: '⚙️', label: 'System', path: '/system' }
			]
			return { args, customNavItems }
		},
		template: `
			<DashboardLayout v-bind="args" :navigationItems="customNavItems">
				<div style="padding: 24px;">
					<h1>Custom Navigation Example</h1>
					<p style="margin-top: 16px; color: #666;">
						This example demonstrates how to override the default navigation items
						with custom ones for specific use cases.
					</p>
				</div>
			</DashboardLayout>
		`
	} )
}