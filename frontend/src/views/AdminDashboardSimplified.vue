<template>
	<div class="dashboard container-responsive">
		<DashboardHeader
			title="Kagi Admin"
			user-role="System Admin"
			:user="user"
			@menu-toggle="showMobileMenu = !showMobileMenu"
		/>

		<MobileSettingsMenu
			:show="showMobileMenu"
			:user="user"
			user-role="System Admin"
			@close="showMobileMenu = false"
		/>

		<div class="grid-dashboard px-6 py-6">
			<DashboardNavigation
				:items="menuItems"
				:active-item="activeSection"
				@navigate="activeSection = $event"
			/>

			<main class="main-content">
				<!-- Overview Section - Using modern CSS Grid -->
				<DashboardSection
					:active="activeSection === 'overview'"
					title="System Overview"
					icon="📊"
				>
					<div class="grid grid-auto-fit-md gap-6 mb-6">
						<div class="card" data-variant="primary">
							<div class="flex-between mb-4">
								<span class="text-3xl">🏢</span>
								<StatusBadge status="active" />
							</div>
							<h3 class="text-2xl font-bold">{{ buildings.length }}</h3>
							<p class="text-secondary text-sm">Total Buildings</p>
						</div>

						<div class="card" data-variant="success">
							<div class="flex-between mb-4">
								<span class="text-3xl">👥</span>
								<span class="text-sm text-success">+12%</span>
							</div>
							<h3 class="text-2xl font-bold">1,234</h3>
							<p class="text-secondary text-sm">Active Users</p>
						</div>

						<div class="card" data-variant="warning">
							<div class="flex-between mb-4">
								<span class="text-3xl">💰</span>
								<span class="text-sm font-semibold">Monthly</span>
							</div>
							<h3 class="text-2xl font-bold">¥45.2M</h3>
							<p class="text-secondary text-sm">Revenue</p>
						</div>
					</div>
				</DashboardSection>

				<!-- Buildings Section - Using data-table component -->
				<DashboardSection
					:active="activeSection === 'buildings'"
					title="Buildings Management"
					icon="🏢"
					show-search
				>
					<KDataTable
						:columns="buildingColumns"
						:data="buildings"
						empty-text="No buildings registered"
					>
						<template #header>
							<KButton @click="showAddBuildingModal = true">
								Add Building
							</KButton>
						</template>

						<template #cell-status="{ value }">
							<StatusBadge :status="value" />
						</template>

						<template #actions="{ row }">
							<button class="btn-ghost btn-sm" @click="editBuilding(row)">
								Edit
							</button>
						</template>
					</KDataTable>
				</DashboardSection>

				<!-- Users Section - Modern card grid -->
				<DashboardSection
					:active="activeSection === 'users'"
					title="User Management"
					icon="👥"
				>
					<div class="grid grid-auto-fit-lg gap-4">
						<div
							v-for="person in users"
							:key="person.id"
							class="card card-hover"
							:data-status="person.status"
						>
							<div class="flex gap-4">
								<div class="avatar">
									{{ person.name.charAt(0) }}
								</div>
								<div class="flex-1">
									<h4 class="font-semibold">{{ person.name }}</h4>
									<p class="text-sm text-secondary">{{ person.email }}</p>
									<div class="flex gap-2 mt-2">
										<StatusBadge :status="person.role" small />
										<StatusBadge :status="person.status" small />
									</div>
								</div>
							</div>
						</div>
					</div>
				</DashboardSection>

				<!-- Analytics Section - Using CSS Grid areas -->
				<DashboardSection
					:active="activeSection === 'analytics'"
					title="Analytics"
					icon="📈"
				>
					<div class="analytics-grid">
						<div class="chart-main card">
							<h3 class="mb-4">Revenue Trend</h3>
							<!-- Chart component would go here -->
							<div class="placeholder-chart">Chart Placeholder</div>
						</div>
						<div class="stats-side">
							<div class="card mb-4">
								<h4 class="text-sm text-secondary mb-2">This Month</h4>
								<p class="text-2xl font-bold">¥12.5M</p>
								<span class="text-success text-sm">↑ 15%</span>
							</div>
							<div class="card">
								<h4 class="text-sm text-secondary mb-2">Active Users</h4>
								<p class="text-2xl font-bold">892</p>
								<span class="text-warning text-sm">↓ 3%</span>
							</div>
						</div>
					</div>
				</DashboardSection>

				<!-- Settings Section - Using FormSection component -->
				<DashboardSection
					:active="activeSection === 'settings'"
					title="System Settings"
					icon="⚙️"
				>
					<FormSection
						title="General Settings"
						@submit="saveSettings"
					>
						<div class="grid grid-auto-fit-md gap-4">
							<KInput
								v-model="settings.siteName"
								label="Site Name"
							/>
							<KInput
								v-model="settings.adminEmail"
								label="Admin Email"
								type="email"
							/>
							<KSelect
								v-model="settings.timezone"
								label="Timezone"
								:options="timezones"
							/>
							<KSwitch
								v-model="settings.maintenanceMode"
								label="Maintenance Mode"
							/>
						</div>
					</FormSection>
				</DashboardSection>
			</main>
		</div>

		<!-- Modals using KModal component -->
		<KModal v-if="showAddBuildingModal" @close="showAddBuildingModal = false">
			<template #header>Add New Building</template>
			<FormSection show-cancel @submit="addBuilding" @cancel="showAddBuildingModal = false">
				<div class="grid gap-4">
					<KInput v-model="newBuilding.name" label="Building Name" required />
					<KInput v-model="newBuilding.address" label="Address" required />
					<KInput v-model="newBuilding.units" label="Number of Units" type="number" required />
					<KSelect v-model="newBuilding.type" label="Building Type" :options="buildingTypes" />
				</div>
			</FormSection>
		</KModal>
	</div>
</template>

<script>
import * as store from '../store'

export default {
	name: 'AdminDashboardSimplified',
	data() {
		return {
			activeSection: 'overview',
			showMobileMenu: false,
			showAddBuildingModal: false,

			menuItems: [
				{ id: 'overview', icon: '📊', label: 'Overview' },
				{ id: 'buildings', icon: '🏢', label: 'Buildings' },
				{ id: 'users', icon: '👥', label: 'Users' },
				{ id: 'analytics', icon: '📈', label: 'Analytics' },
				{ id: 'settings', icon: '⚙️', label: 'Settings' }
			],

			buildings: [],
			users: [],

			newBuilding: {
				name: '',
				address: '',
				units: '',
				type: 'mansion'
			},

			buildingColumns: [
				{ key: 'name', label: 'Building Name' },
				{ key: 'address', label: 'Address' },
				{ key: 'units', label: 'Units', width: '100px' },
				{ key: 'status', label: 'Status', width: '120px', type: 'status' }
			],

			buildingTypes: [
				{ value: 'mansion', label: 'Mansion' },
				{ value: 'tower', label: 'Tower' },
				{ value: 'condominium', label: 'Condominium' }
			],

			settings: {
				siteName: 'Kagi Building Management',
				adminEmail: 'admin@kagi.com',
				timezone: 'Asia/Tokyo',
				maintenanceMode: false
			},

			timezones: [
				{ value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
				{ value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
				{ value: 'UTC', label: 'UTC' }
			]
		}
	},
	computed: {
		user() {
			return store.user.value
		}
	},
	async mounted() {
		await this.loadData()
	},
	methods: {
		async loadData() {
			// Simulate API calls
			this.buildings = [
				{ id: 1, name: 'Sakura Tower', address: 'Shibuya, Tokyo', units: 120, status: 'active' },
				{ id: 2, name: 'Ocean View', address: 'Minato, Tokyo', units: 85, status: 'active' },
				{ id: 3, name: 'Green Hills', address: 'Meguro, Tokyo', units: 64, status: 'maintenance' }
			]

			this.users = [
				{ id: 1, name: 'Tanaka Admin', email: 'tanaka@kagi.com', role: 'admin', status: 'active' },
				{ id: 2, name: 'Sato Manager', email: 'sato@kagi.com', role: 'manager', status: 'active' },
				{ id: 3, name: 'Yamada Staff', email: 'yamada@kagi.com', role: 'staff', status: 'inactive' }
			]
		},

		async addBuilding() {
			console.log( 'Adding building:', this.newBuilding )
			this.showAddBuildingModal = false
			await this.loadData()
		},

		editBuilding(building) {
			console.log( 'Edit building:', building )
		},

		async saveSettings() {
			console.log( 'Saving settings:', this.settings )
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../styles/utilities.styl'

// Using modern CSS with utilities
.dashboard
	min-height: 100vh
	background: var(--gradient-surface)

// Avatar using CSS only (no extra HTML)
.avatar
	width: 48px
	height: 48px
	background: var(--gradient-primary)
	color: white
	border-radius: var(--radius-full)
	display: flex
	align-items: center
	justify-content: center
	font-weight: var(--font-bold)
	font-size: var(--text-lg)

// Modern grid layout for analytics
.analytics-grid
	display: grid
	grid-template-areas:
		"chart stats"
	grid-template-columns: 1fr 300px
	gap: var(--space-6)

	@container (max-width: 768px)
		grid-template-areas:
			"chart"
			"stats"
		grid-template-columns: 1fr

.chart-main
	grid-area: chart

.stats-side
	grid-area: stats

.placeholder-chart
	height: 300px
	background: var(--gradient-surface)
	border-radius: var(--radius-lg)
	display: flex
	align-items: center
	justify-content: center
	color: var(--color-text-secondary)

// Simplified button styles
.btn-sm
	padding: var(--space-2) var(--space-3)
	font-size: var(--text-sm)

// Use CSS custom properties for dynamic theming
.card[data-status="active"]::after
	content: "●"
	position: absolute
	top: var(--space-2)
	right: var(--space-2)
	color: var(--color-success-500)

.card[data-status="maintenance"]::after
	content: "●"
	position: absolute
	top: var(--space-2)
	right: var(--space-2)
	color: var(--color-warning-500)
</style>