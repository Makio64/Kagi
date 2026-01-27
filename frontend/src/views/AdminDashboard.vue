<template>
	<DashboardLayout
		:title="$t('admin.title')"
		:user-email="user?.email || 'Admin'"
		user-role="System Administrator"
		:menu-items="menuItemsWithLabels"
		:active-section="activeSection"
		@navigate="navigateToSection"
		@logout="store.logout()"
		@logo-click="navigateToSection('overview')"
	>
		<div class="admin-dashboard-content">
			<!-- Overview Section -->
			<AdminOverviewSection v-if="activeSection === 'overview'" />

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

		</div>

		<!-- Add Building Modal -->
		<KModal
			v-model="showAddBuildingModal"
			:title="$t('admin.buildings.addNew')"
			size="medium"
		>
			<form @submit.prevent="addBuilding">
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
			</form>

			<template #footer>
				<KButton variant="secondary" @click="showAddBuildingModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="primary" :loading="isAddingBuilding" @click="addBuilding">
					{{ $t('common.save') }}
				</KButton>
			</template>
		</KModal>
	</DashboardLayout>
</template>

<script>
import { ADMIN_MENU_ITEMS } from '../constants/dashboardMenus'
import * as MockData from '../services/MockData'
import * as store from '../store'

export default {
	name: 'AdminDashboard',
	data() {
		return {
			activeSection: 'overview',
			showAddBuildingModal: false,
			isAddingBuilding: false,
			newBuilding: {
				name: '',
				address: '',
				description: '',
				units: null,
				floors: null,
				facilities: [],
				rules: ''
			},
			menuItems: ADMIN_MENU_ITEMS,
			buildings: MockData.getBuildings(),
			users: MockData.getUsers(),
			maintenanceRequests: MockData.getAdminMaintenanceRequests(),
			buildingPayments: MockData.getBuildingPayments()
		}
	},
	computed: {
		USE_MOCK_BACKEND() {
			return store.USE_MOCK_BACKEND
		},
		user() {
			return store.user.value
		},
		menuItemsWithLabels() {
			return this.menuItems.map( ( item ) => ( {
				...item,
				translationKey: `admin.menu.${item.id}`
			} ) )
		}
	},
	watch: {
		activeSection() {
			this.$nextTick( () => {
				document.querySelector( '#app' )?.scrollTo( 0, 0 )
			} )
		}
	},
	mounted() {
		document.querySelector( '#app' )?.scrollTo( 0, 0 )

		// Security: Verify user has admin role
		if ( !store.isAuthenticated.value ) {
			this.$router.push( '/login' )
			return
		}
		if ( !store.isAdmin.value ) {
			// Redirect to appropriate dashboard based on role
			if ( store.isMansionAdmin.value || store.userRole.value === 'manager' ) {
				this.$router.push( '/mansion-dashboard' )
			} else {
				this.$router.push( '/dashboard' )
			}
		}
	},
	methods: {
		navigateToSection( section ) {
			this.activeSection = section
		},
		closeAddBuildingModal() {
			this.showAddBuildingModal = false
		},
		async addBuilding() {
			this.isAddingBuilding = true
			try {
				// TODO: Implement backend call
				console.log( 'Adding building:', this.newBuilding )
				this.showAddBuildingModal = false
				// Reset form
				this.newBuilding = {
					name: '',
					address: '',
					description: '',
					units: null,
					floors: null,
					facilities: [],
					rules: ''
				}
			} catch ( error ) {
				console.error( 'Failed to add building:', error )
			} finally {
				this.isAddingBuilding = false
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../styles/tokens.styl'

.admin-dashboard-content
	width 100%

.section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

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
