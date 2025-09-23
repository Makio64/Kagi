<template>
	<div class="dashboard">
		<!-- Dashboard Header -->
		<DashboardHeader
			:title="$t('admin.title')"
			user-badge="System Admin"
			:user-email="user?.email || 'Admin'"
			user-role="System Administrator"
			:show-language-switcher="true"
			@logout="store.logout()"
		/>

		<!-- Main Content -->
		<div class="dashboard-content">
			<!-- Sidebar - Desktop -->
			<aside class="sidebar">
				<nav class="nav-menu">
					<button
						v-for="item in menuItems"
						:key="item.id"
						class="nav-item"
						:class="{ active: activeSection === item.id }"
						@click="navigateToSection(item.id)"
					>
						<span class="nav-icon">{{ item.icon }}</span>
						<span class="nav-label">{{ $t(`admin.menu.${item.id}`) }}</span>
					</button>
				</nav>

				<!-- Mobile Navigation -->
				<nav class="nav-menu-mobile">
					<button
						v-for="item in menuItems"
						:key="item.id"
						class="nav-item-mobile"
						:class="{ active: activeSection === item.id }"
						@click="navigateToSection(item.id)"
					>
						<div class="nav-icon-circle">
							<span class="nav-icon">{{ item.icon }}</span>
						</div>
						<span class="nav-label-mobile">{{ $t(`admin.menu.${item.id}`) }}</span>
					</button>
				</nav>
			</aside>

			<main class="main-content">
				<!-- Overview Section -->
				<section v-if="activeSection === 'overview'" class="section">
					<SectionHeader
						:title="$t('admin.overview.title')"
						icon="📊"
					/>

					<!-- Statistics Cards -->
					<div class="stats-grid">
						<StatCard
							icon="🏢"
							:label="$t('admin.stats.buildings')"
							:value="12"
							variant="primary"
							:trend="{ text: '+2 this month', positive: true }"
						/>
						<StatCard
							icon="👥"
							:label="$t('admin.stats.residents')"
							:value="1248"
							variant="secondary"
							:trend="{ text: '+48 this month', positive: true }"
						/>
						<StatCard
							icon="🔧"
							:label="$t('admin.stats.maintenance')"
							:value="23"
							variant="warning"
							:trend="{ text: '8 urgent', positive: false }"
						/>
						<StatCard
							icon="💰"
							:label="$t('admin.stats.revenue')"
							:value="12500000"
							format="currency"
							variant="success"
							:trend="{ text: '+12%', positive: true }"
						/>
					</div>

					<!-- Recent Activities -->
					<KCard title="Recent Activity" icon="🔔" variant="default" elevated>
						<div class="activity-list">
							<div class="activity-item">
								<span class="activity-icon">🔧</span>
								<div class="activity-content">
									<p>New maintenance request from Unit 502</p>
									<span class="activity-time">5 minutes ago</span>
								</div>
							</div>
							<div class="activity-item">
								<span class="activity-icon">📅</span>
								<div class="activity-content">
									<p>Party Room booked for Dec 25</p>
									<span class="activity-time">1 hour ago</span>
								</div>
							</div>
							<div class="activity-item">
								<span class="activity-icon">💳</span>
								<div class="activity-content">
									<p>15 residents paid management fees</p>
									<span class="activity-time">Today</span>
								</div>
							</div>
						</div>
					</KCard>
				</section>

				<!-- Buildings Management -->
				<section v-if="activeSection === 'buildings'" class="section">
					<SectionHeader
						:title="$t('admin.buildings.title')"
						icon="🏢"
					>
						<template #actions>
							<KButton variant="primary" icon="➕" @click="showAddBuildingModal = true">
								{{ $t('admin.buildings.add') }}
							</KButton>
						</template>
					</SectionHeader>

					<div class="buildings-list">
						<KCard
							v-for="building in buildings"
							:key="building.id"
							:title="building.name"
							variant="default"
							outlined
						>
							<template #badge>
								<span class="building-status" :class="building.status">{{ building.status }}</span>
							</template>
							<div class="building-info">
								<p><strong>{{ $t('admin.buildings.address') }}:</strong> {{ building.address }}</p>
								<p><strong>{{ $t('admin.buildings.units') }}:</strong> {{ building.units }}</p>
								<p><strong>{{ $t('admin.buildings.occupancy') }}:</strong> {{ building.occupancy }}%</p>
							</div>
							<template #footer>
								<div class="building-actions">
									<KButton size="sm" variant="secondary">{{ $t('common.edit') }}</KButton>
									<KButton size="sm" variant="primary">{{ $t('admin.buildings.manage') }}</KButton>
									<KButton size="sm" variant="danger">{{ $t('common.delete') }}</KButton>
								</div>
							</template>
						</KCard>
					</div>
				</section>

				<!-- Users Management -->
				<section v-if="activeSection === 'users'" class="section">
					<SectionHeader
						:title="$t('admin.users.title')"
						icon="👥"
						searchable
						search-placeholder="Search users..."
					>
						<template #actions>
							<KButton variant="primary" icon="➕">
								{{ $t('admin.users.invite') }}
							</KButton>
						</template>
					</SectionHeader>

					<KCard elevated no-padding>
						<div class="users-table">
							<table>
								<thead>
									<tr>
										<th>{{ $t('admin.users.name') }}</th>
										<th>{{ $t('admin.users.email') }}</th>
										<th>{{ $t('admin.users.role') }}</th>
										<th>{{ $t('admin.users.building') }}</th>
										<th>{{ $t('admin.users.status') }}</th>
										<th>{{ $t('admin.users.actions') }}</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="u in users" :key="u.id">
										<td>{{ u.name }}</td>
										<td>{{ u.email }}</td>
										<td><span class="role-badge" :class="u.role">{{ u.role }}</span></td>
										<td>{{ u.building }}</td>
										<td><span class="status-badge" :class="u.status">{{ u.status }}</span></td>
										<td>
											<KButton size="xs" icon="✏️" variant="ghost" />
											<KButton size="xs" icon="🗑️" variant="ghost" />
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</KCard>
				</section>

				<!-- Maintenance Overview -->
				<section v-if="activeSection === 'maintenance'" class="section">
					<SectionHeader
						:title="$t('admin.maintenance.title')"
						icon="🔧"
					/>

					<div class="maintenance-stats">
						<StatCard
							icon="🚨"
							:label="$t('admin.maintenance.urgent')"
							:value="8"
							variant="danger"
						/>
						<StatCard
							icon="⏳"
							:label="$t('admin.maintenance.pending')"
							:value="15"
							variant="warning"
						/>
						<StatCard
							icon="🔧"
							:label="$t('admin.maintenance.inProgress')"
							:value="12"
							variant="info"
						/>
						<StatCard
							icon="✅"
							:label="$t('admin.maintenance.completed')"
							:value="142"
							variant="success"
						/>
					</div>

					<KCard
						:title="$t('admin.maintenance.recent')"
						elevated
					>
						<div class="requests-list">
							<div v-for="request in maintenanceRequests" :key="request.id" class="request-card">
								<div class="request-header">
									<span class="priority" :class="request.priority">{{ request.priority }}</span>
									<h4>{{ request.title }}</h4>
									<span class="request-time">{{ request.time }}</span>
								</div>
								<p>{{ request.description }}</p>
								<div class="request-footer">
									<span class="request-unit">Unit {{ request.unit }}</span>
									<KButton size="sm" variant="primary">
										{{ $t('admin.maintenance.assign') }}
									</KButton>
								</div>
							</div>
						</div>
					</KCard>
				</section>

				<!-- Financial Reports -->
				<section v-if="activeSection === 'financial'" class="section">
					<SectionHeader
						:title="$t('admin.financial.title')"
						icon="💰"
					>
						<template #actions>
							<KButton variant="secondary" icon="📥">
								{{ $t('admin.financial.export') }}
							</KButton>
						</template>
					</SectionHeader>

					<div class="financial-summary">
						<StatCard
							icon="💵"
							:label="$t('admin.financial.revenue')"
							:value="152340000"
							format="currency"
							subtext="This Year"
							variant="primary"
						/>
						<StatCard
							icon="💸"
							:label="$t('admin.financial.expenses')"
							:value="98200000"
							format="currency"
							subtext="This Year"
							variant="secondary"
						/>
						<StatCard
							icon="💰"
							:label="$t('admin.financial.profit')"
							:value="54140000"
							format="currency"
							subtext="This Year"
							variant="success"
						/>
					</div>

					<KCard
						:title="$t('admin.financial.paymentStatus')"
						elevated
					>
						<div class="payment-grid">
							<div v-for="building in buildingPayments" :key="building.id" class="payment-card">
								<h4>{{ building.name }}</h4>
								<div class="payment-bar">
									<div class="payment-progress" :style="`width: ${building.percentage}%`" />
								</div>
								<p>{{ building.percentage }}% collected ({{ building.collected }}/{{ building.total }})</p>
							</div>
						</div>
					</KCard>
				</section>

				<!-- Settings -->
				<section v-if="activeSection === 'settings'" class="section">
					<SectionHeader
						:title="$t('admin.settings.title')"
						icon="⚙️"
					/>

					<div class="settings-sections">
						<KCard
							:title="$t('admin.settings.notifications')"
							icon="🔔"
							outlined
						>
							<div class="setting-item">
								<label>
									<input type="checkbox" checked>
									{{ $t('admin.settings.emailNotifications') }}
								</label>
							</div>
							<div class="setting-item">
								<label>
									<input type="checkbox" checked>
									{{ $t('admin.settings.dailyReports') }}
								</label>
							</div>
						</KCard>

						<KCard
							:title="$t('admin.settings.security')"
							icon="🔐"
							outlined
						>
							<div class="setting-item">
								<label>{{ $t('admin.settings.twoFactor') }}</label>
								<KButton size="sm" variant="primary">
									{{ $t('admin.settings.enable') }}
								</KButton>
							</div>
							<div class="setting-item">
								<label>{{ $t('admin.settings.sessionTimeout') }}</label>
								<select>
									<option>30 minutes</option>
									<option>1 hour</option>
									<option>2 hours</option>
								</select>
							</div>
						</KCard>

						<KCard
							:title="$t('admin.settings.appearance')"
							icon="🎨"
							outlined
						>
							<div class="setting-item">
								<label>{{ $t('common.language') }}</label>
								<LanguageSwitcher />
							</div>
						</KCard>
					</div>
				</section>

				<!-- Add Building Modal -->
				<transition name="modal">
					<div v-if="showAddBuildingModal" class="modal-overlay" @click.self="closeAddBuildingModal">
						<div class="modal-content">
							<div class="modal-header">
								<h3>{{ $t('admin.buildings.addNew') }}</h3>
								<button class="modal-close" @click="closeAddBuildingModal">✕</button>
							</div>
							<form class="modal-body" @submit.prevent="addBuilding">
								<div class="form-group">
									<label for="building-name">{{ $t('admin.buildings.name') }} *</label>
									<input
										id="building-name"
										v-model="newBuilding.name"
										type="text"
										required
										placeholder="e.g. Sakura Tower"
									>
								</div>
								<div class="form-group">
									<label for="building-address">{{ $t('admin.buildings.address') }} *</label>
									<input
										id="building-address"
										v-model="newBuilding.address"
										type="text"
										required
										placeholder="e.g. 1-2-3 Shibuya, Tokyo"
									>
								</div>
								<div class="form-group">
									<label for="building-description">{{ $t('admin.buildings.description') }}</label>
									<textarea
										id="building-description"
										v-model="newBuilding.description"
										rows="3"
										placeholder="Brief description of the building..."
									/>
								</div>
								<div class="form-row">
									<div class="form-group">
										<label for="building-units">{{ $t('admin.buildings.totalUnits') }}</label>
										<input
											id="building-units"
											v-model.number="newBuilding.units"
											type="number"
											min="1"
											placeholder="120"
										>
									</div>
									<div class="form-group">
										<label for="building-floors">{{ $t('admin.buildings.floors') }}</label>
										<input
											id="building-floors"
											v-model.number="newBuilding.floors"
											type="number"
											min="1"
											placeholder="15"
										>
									</div>
								</div>
								<div class="form-group">
									<label>{{ $t('admin.buildings.facilities') }}</label>
									<div class="facilities-checkboxes">
										<label class="checkbox-label">
											<input v-model="newBuilding.facilities" type="checkbox" value="gym">
											<span>{{ $t('facilities.gym') }}</span>
										</label>
										<label class="checkbox-label">
											<input v-model="newBuilding.facilities" type="checkbox" value="pool">
											<span>{{ $t('facilities.pool') }}</span>
										</label>
										<label class="checkbox-label">
											<input v-model="newBuilding.facilities" type="checkbox" value="parking">
											<span>{{ $t('facilities.parking') }}</span>
										</label>
										<label class="checkbox-label">
											<input v-model="newBuilding.facilities" type="checkbox" value="lounge">
											<span>{{ $t('facilities.lounge') }}</span>
										</label>
										<label class="checkbox-label">
											<input v-model="newBuilding.facilities" type="checkbox" value="rooftop">
											<span>{{ $t('facilities.rooftop') }}</span>
										</label>
										<label class="checkbox-label">
											<input v-model="newBuilding.facilities" type="checkbox" value="laundry">
											<span>{{ $t('facilities.laundry') }}</span>
										</label>
									</div>
								</div>
								<div class="form-group">
									<label for="building-rules">{{ $t('admin.buildings.rules') }}</label>
									<textarea
										id="building-rules"
										v-model="newBuilding.rules"
										rows="4"
										placeholder="Enter building rules and regulations..."
									/>
								</div>
								<div class="modal-actions">
									<KButton type="button" variant="secondary" @click="closeAddBuildingModal">
										{{ $t('common.cancel') }}
									</KButton>
									<KButton type="submit" variant="primary" :loading="isAddingBuilding">
										{{ $t('common.save') }}
									</KButton>
								</div>
							</form>
						</div>
					</div>
				</transition>
			</main>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue'

// Stores
import * as store from '../store'


// Computed properties for store
const user = computed( () => store.user.value )
const token = computed( () => store.token.value )

// Navigation
const activeSection = ref( 'overview' )

// Menu items for sidebar
const menuItems = ref( [
	{ id: 'overview', icon: '📊', label: 'Overview' },
	{ id: 'buildings', icon: '🏢', label: 'Buildings' },
	{ id: 'users', icon: '👥', label: 'Users' },
	{ id: 'maintenance', icon: '🔧', label: 'Maintenance' },
	{ id: 'reports', icon: '📈', label: 'Reports' },
	{ id: 'settings', icon: '⚙️', label: 'Settings' }
] )

const navigateToSection = ( section ) => {
	activeSection.value = section
}

// Sample data
const buildings = ref( [
	{ id: 1, name: 'Sakura Tower', address: 'Shibuya, Tokyo', units: 120, occupancy: 95, status: 'active' },
	{ id: 2, name: 'Maple Heights', address: 'Shinjuku, Tokyo', units: 80, occupancy: 88, status: 'active' },
	{ id: 3, name: 'Ocean View', address: 'Minato, Tokyo', units: 200, occupancy: 92, status: 'active' }
] )

const users = ref( [
	{ id: 1, name: 'Tanaka Yuki', email: 'tanaka@example.com', role: 'resident', building: 'Sakura Tower', status: 'active' },
	{ id: 2, name: 'Sato Kenji', email: 'sato@example.com', role: 'mansion_admin', building: 'Maple Heights', status: 'active' },
	{ id: 3, name: 'Yamada Hana', email: 'yamada@example.com', role: 'resident', building: 'Ocean View', status: 'active' }
] )

const maintenanceRequests = ref( [
	{ id: 1, title: 'Water leak in bathroom', description: 'Urgent: Water dripping from ceiling', unit: '502', priority: 'urgent', time: '10 min ago' },
	{ id: 2, title: 'AC not working', description: 'Air conditioning unit making strange noise', unit: '301', priority: 'high', time: '1 hour ago' },
	{ id: 3, title: 'Door lock issue', description: 'Key card reader not responding', unit: '105', priority: 'medium', time: '3 hours ago' }
] )

const buildingPayments = ref( [
	{ id: 1, name: 'Sakura Tower', percentage: 92, collected: '110', total: '120' },
	{ id: 2, name: 'Maple Heights', percentage: 85, collected: '68', total: '80' },
	{ id: 3, name: 'Ocean View', percentage: 78, collected: '156', total: '200' }
] )

// Add Building Modal State
const showAddBuildingModal = ref( false )
const isAddingBuilding = ref( false )
const newBuilding = ref( {
	name: '',
	address: '',
	description: '',
	units: null,
	floors: null,
	facilities: [],
	rules: ''
} )

const closeAddBuildingModal = () => {
	showAddBuildingModal.value = false
	// Reset form
	newBuilding.value = {
		name: '',
		address: '',
		description: '',
		units: null,
		floors: null,
		facilities: [],
		rules: ''
	}
}

const addBuilding = async () => {
	if ( !newBuilding.value.name || !newBuilding.value.address ) {
		alert( 'Please fill in required fields' )
		return
	}

	isAddingBuilding.value = true

	try {
		// Prepare the data for API
		const buildingData = {
			name: newBuilding.value.name,
			address: newBuilding.value.address,
			description: newBuilding.value.description || '',
			facilities: newBuilding.value.facilities.join( ', ' ),
			rules: newBuilding.value.rules || ''
		}

		// Check if we're in test mode or real mode
		if ( store.USE_MOCK_BACKEND ) {
			// In test mode, just add to local array
			const newId = Math.max( ...buildings.value.map( b => b.id ) ) + 1
			buildings.value.push( {
				id: newId,
				name: newBuilding.value.name,
				address: newBuilding.value.address,
				units: newBuilding.value.units || 0,
				occupancy: 0,
				status: 'active'
			} )

			// Show success message
			alert( `Building "${newBuilding.value.name}" added successfully!` )
		} else {
			// Make API call to backend
			const response = await fetch( 'http://localhost:3333/api/mansions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token.value}`
				},
				credentials: 'include',
				body: JSON.stringify( buildingData )
			} )

			if ( !response.ok ) {
				throw new Error( 'Failed to add building' )
			}

			const data = await response.json()

			// Add to local array
			buildings.value.push( {
				id: data.mansion.id,
				name: data.mansion.name,
				address: data.mansion.address,
				units: newBuilding.value.units || 0,
				occupancy: 0,
				status: 'active'
			} )

			// Show success message
			alert( `Building "${data.mansion.name}" added successfully!` )
		}

		// Close modal
		closeAddBuildingModal()
	} catch ( error ) {
		console.error( 'Error adding building:', error )
		alert( 'Failed to add building. Please try again.' )
	} finally {
		isAddingBuilding.value = false
	}
}
</script>

<style lang="stylus" scoped>
@import '../styles/tokens.styl'

.dashboard
	min-height 100vh
	display flex
	flex-direction column
	background linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)
	box-sizing border-box

// Global box-sizing fix
*, *::before, *::after
	box-sizing border-box

.dashboard-content
	display flex
	flex 1
	max-width 1400px
	margin 0 auto
	width 100%
	gap 2rem
	padding 2rem

	@media (max-width: 768px)
		padding 1rem
		gap 1rem

	@media (max-width: 550px)
		padding 0.5rem
		gap 0.5rem

.sidebar
	width 250px
	background white
	border-radius 20px
	padding 1.5rem
	box-shadow 0 8px 25px rgba(255, 193, 7, 0.08)
	height fit-content
	position sticky
	top 100px
	border 1px solid rgba(255, 193, 7, 0.15)

	@media (max-width: 768px)
		width 100%
		padding 0.75rem 0
		border-radius 0
		box-shadow none
		background #f9f9f9
		position static
		border-bottom 2px solid #e0e0e0

.nav-menu
	display flex
	flex-direction column
	gap 0.5rem

	@media (max-width: 768px)
		display none

// Mobile menu - hidden on desktop
.nav-menu-mobile
	display none

	@media (max-width: 768px)
		display flex
		flex-direction row
		gap 0.75rem
		padding-bottom 0.5rem
		overflow-x auto
		overflow-y hidden
		-webkit-overflow-scrolling touch
		scrollbar-width thin

		&::-webkit-scrollbar
			height 4px

		&::-webkit-scrollbar-track
			background #f0f0f0
			border-radius 2px

		&::-webkit-scrollbar-thumb
			background #ccc
			border-radius 2px

	@media (max-width: 550px)
		gap 0.4rem

.nav-item
	display flex
	align-items center
	gap 1rem
	padding 1rem
	background transparent
	border none
	border-radius 15px
	cursor pointer
	transition all 0.3s ease
	text-align left
	text-decoration none
	color #666
	width 100%
	font-size 0.95rem
	font-family inherit

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		color #333
		transform translateX(5px)

	&.active
		background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
		color white
		font-weight 600
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.3)

	.nav-icon
		font-size 1.2rem

	.nav-label
		font-size 0.95rem

// Mobile navigation items
.nav-item-mobile
	display flex
	flex-direction column
	align-items center
	gap 0.5rem
	padding 0.5rem
	background transparent
	border none
	cursor pointer
	transition all 0.2s ease
	min-width 70px
	flex-shrink 0

	@media (max-width: 550px)
		min-width 60px
		padding 0.25rem

	.nav-icon-circle
		width 50px
		height 50px
		border-radius 50%
		background white
		display flex
		align-items center
		justify-content center
		box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)
		transition all 0.2s ease

		@media (max-width: 550px)
			width 45px
			height 45px

	.nav-icon
		font-size 1.5rem

		@media (max-width: 550px)
			font-size 1.3rem

	.nav-label-mobile
		font-size 0.75rem
		color #666
		text-align center

		@media (max-width: 550px)
			font-size 0.7rem

	&:hover
		.nav-icon-circle
			background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
			transform scale(1.05)

	&.active
		.nav-icon-circle
			background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
			box-shadow 0 4px 12px rgba(255, 193, 7, 0.4)

		.nav-label-mobile
			color #333
			font-weight 600

.main-content
	flex 1
	background white
	border-radius 20px
	padding 2rem
	box-shadow 0 8px 25px rgba(255, 193, 7, 0.08)
	border 1px solid rgba(255, 193, 7, 0.15)
	overflow-x hidden

	@media (max-width: 768px)
		padding 1.5rem
		border-radius 15px

	@media (max-width: 550px)
		padding 1rem
		border-radius 10px

.section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

.section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

// Stats grid
.stats-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(280px, 1fr))
	gap 1.5rem
	margin-bottom 2rem

// Maintenance stats
.maintenance-stats
	display grid
	grid-template-columns repeat(auto-fit, minmax(250px, 1fr))
	gap 1rem
	margin-bottom 2rem

// Financial summary
.financial-summary
	display grid
	grid-template-columns repeat(3, 1fr)
	gap 1.5rem
	margin-bottom 2rem

	@media (max-width: 768px)
		grid-template-columns 1fr

// Activity list
.activity-list
	display flex
	flex-direction column
	gap 1rem

.activity-item
	display flex
	gap 1rem
	padding 1rem
	background #f9f9f9
	border-radius 10px

	.activity-icon
		font-size 1.5rem

	.activity-content
		flex 1

		p
			margin 0 0 0.25rem 0
			color #333

		.activity-time
			color #999
			font-size 0.85rem

// Buildings list
.buildings-list
	display grid
	grid-template-columns repeat(auto-fill, minmax(350px, 1fr))
	gap 1.5rem

.building-info
	p
		margin 0.5rem 0
		color #666
		font-size 0.95rem

.building-actions
	display flex
	gap 0.5rem
	width 100%

.building-status
	padding 0.25rem 0.75rem
	border-radius 20px
	font-size 0.85rem

	&.active
		background #E8F5E9
		color #4CAF50

// Users table
.users-table
	overflow-x auto

	table
		width 100%
		border-collapse collapse

		th
			background $color-bg-tertiary
			padding 1rem
			text-align left
			color #333
			font-weight 600
			border-bottom 2px solid $color-primary

		td
			padding 1rem
			border-bottom 1px solid #f0f0f0

		tbody tr:hover
			background #f9f9f9

	.role-badge, .status-badge
		padding 0.25rem 0.5rem
		border-radius 12px
		font-size 0.85rem

		&.resident
			background #E3F2FD
			color #2196F3

		&.mansion_admin
			background #FFF3E0
			color #FF9800

		&.active
			background #E8F5E9
			color #4CAF50

// Requests list
.requests-list
	display flex
	flex-direction column
	gap 1rem

.request-card
	padding 1rem
	background #f9f9f9
	border-radius 10px

	.request-header
		display flex
		align-items center
		gap 1rem
		margin-bottom 0.5rem

		.priority
			padding 0.25rem 0.5rem
			border-radius 12px
			font-size 0.75rem
			font-weight 600

			&.urgent
				background #FFEBEE
				color #F44336

			&.high
				background #FFF3E0
				color #FF9800

			&.medium
				background #E3F2FD
				color #2196F3

		h4
			flex 1
			margin 0
			color #333

		.request-time
			color #999
			font-size 0.85rem

	p
		margin 0.5rem 0
		color #666

	.request-footer
		display flex
		justify-content space-between
		align-items center
		margin-top 1rem

		.request-unit
			color #999
			font-size 0.9rem

// Payment grid
.payment-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
	gap 1.5rem

.payment-card
	h4
		margin 0 0 0.75rem 0
		color #333

	.payment-bar
		height 20px
		background #f0f0f0
		border-radius 10px
		overflow hidden
		margin-bottom 0.5rem

		.payment-progress
			height 100%
			background linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)
			border-radius 10px
			transition width 0.3s ease

	p
		margin 0
		color #666
		font-size 0.9rem

// Settings sections
.settings-sections
	display grid
	gap 1.5rem

.setting-item
	display flex
	justify-content space-between
	align-items center
	padding 1rem 0
	border-bottom 1px solid #f0f0f0

	&:last-child
		border-bottom none

	label
		color #666
		display flex
		align-items center
		gap 0.5rem

	select
		padding 0.5rem
		border 1px solid #e0e0e0
		border-radius 8px

// Modal Styles
.modal-overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	background rgba(0, 0, 0, 0.5)
	display flex
	align-items center
	justify-content center
	z-index 1000
	padding 1rem

.modal-content
	background white
	border-radius 12px
	max-width 600px
	width 100%
	max-height 90vh
	overflow-y auto
	box-shadow 0 10px 40px rgba(0, 0, 0, 0.2)

.modal-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	border-bottom 1px solid #e0e0e0

	h3
		margin 0
		color #333
		font-size 1.3rem

.modal-close
	background none
	border none
	font-size 1.5rem
	cursor pointer
	color #999
	padding 0
	width 30px
	height 30px
	display flex
	align-items center
	justify-content center
	border-radius 50%
	transition all 0.2s

	&:hover
		background #f5f5f5
		color #333

.modal-body
	padding 1.5rem

.form-group
	margin-bottom 1.2rem

	label
		display block
		margin-bottom 0.5rem
		color #666
		font-weight 500
		font-size 0.9rem

	input, textarea, select
		width 100%
		padding 0.75rem
		border 1px solid #ddd
		border-radius 8px
		font-size 1rem
		transition border-color 0.2s

		&:focus
			outline none
			border-color $color-primary
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

	textarea
		resize vertical
		font-family inherit

.form-row
	display grid
	grid-template-columns 1fr 1fr
	gap 1rem

	@media (max-width: 480px)
		grid-template-columns 1fr

.facilities-checkboxes
	display grid
	grid-template-columns repeat(auto-fill, minmax(150px, 1fr))
	gap 0.75rem
	margin-top 0.5rem

.checkbox-label
	display flex
	align-items center
	cursor pointer
	padding 0.5rem
	border 1px solid #e0e0e0
	border-radius 8px
	transition all 0.2s

	&:hover
		background $color-bg-tertiary
		border-color $color-primary

	input[type="checkbox"]
		margin-right 0.5rem

	span
		font-size 0.9rem
		color #333

.modal-actions
	display flex
	justify-content flex-end
	gap 1rem
	margin-top 2rem
	padding-top 1.5rem
	border-top 1px solid #e0e0e0

// Modal animation
.modal-enter-active, .modal-leave-active
	transition opacity 0.3s

.modal-enter-from, .modal-leave-to
	opacity 0

.modal-enter-active .modal-content
	animation slideUp 0.3s ease-out

@keyframes slideUp
	from
		transform translateY(30px)
		opacity 0
	to
		transform translateY(0)
		opacity 1
</style>
