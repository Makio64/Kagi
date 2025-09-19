<template>
	<DashboardContainer
		:header-title="$t('admin.title') || 'Admin Console'"
		user-badge="System Admin"
		:user-email="user?.email || 'Admin'"
		user-role="System Administrator"
		:show-language-switcher="true"
		:menu-items="menuItems"
		:active-section="activeSection"
		@logout="store.logout()"
		@navigate="navigateToSection"
	>
		<!-- Overview Section -->
		<section v-if="activeSection === 'overview'" class="section">
			<SectionHeader
				:title="$t('admin.overview.title') || 'Management Overview'"
				icon="📊"
			/>

			<!-- Statistics Cards -->
			<div class="stats-grid">
				<StatCard
					v-for="stat in overviewStats"
					:key="stat.id"
					:icon="stat.icon"
					:label="stat.label"
					:value="stat.value"
					:format="stat.format"
					:variant="stat.variant"
					:trend="stat.trend"
				/>
			</div>

			<!-- Recent Activities -->
			<KCard title="Recent Activity" icon="🔔" variant="default" elevated>
				<div class="activity-list">
					<div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
						<span class="activity-icon">{{ activity.icon }}</span>
						<div class="activity-content">
							<p>{{ activity.message }}</p>
							<span class="activity-time">{{ activity.time }}</span>
						</div>
					</div>
				</div>
			</KCard>
		</section>

		<!-- Buildings Management -->
		<section v-if="activeSection === 'buildings'" class="section">
			<SectionHeader
				:title="$t('admin.buildings.title') || 'Buildings Management'"
				icon="🏢"
			>
				<template #actions>
					<KButton variant="primary" icon="➕" @click="showAddBuildingModal = true">
						{{ $t('admin.buildings.add') || 'Add Building' }}
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
						<p><strong>Address:</strong> {{ building.address }}</p>
						<p><strong>Units:</strong> {{ building.units }}</p>
						<p><strong>Occupancy:</strong> {{ building.occupancy }}%</p>
					</div>
					<template #footer>
						<div class="building-actions">
							<KButton size="sm" variant="secondary" @click="editBuilding(building)">Edit</KButton>
							<KButton size="sm" variant="primary">Manage</KButton>
							<KButton size="sm" variant="danger">Delete</KButton>
						</div>
					</template>
				</KCard>
			</div>
		</section>

		<!-- Users Management -->
		<section v-if="activeSection === 'users'" class="section">
			<SectionHeader
				:title="$t('admin.users.title') || 'Users Management'"
				icon="👥"
			/>

			<KTable
				:columns="userColumns"
				:data="users"
				searchable
				search-placeholder="Search users..."
				:show-pagination="true"
				:page-size="10"
				clickable-rows
				@row-click="handleUserClick"
			>
				<template #actions>
					<KButton variant="primary" icon="➕">Invite User</KButton>
				</template>

				<template #cell-role="{ value }">
					<span class="role-badge" :class="value">{{ value }}</span>
				</template>

				<template #cell-status="{ value }">
					<span class="status-badge" :class="value">{{ value }}</span>
				</template>

				<template #cell-actions="{ row }">
					<KButton size="xs" icon="✏️" variant="ghost" @click.stop="editUser(row)" />
					<KButton size="xs" icon="🗑️" variant="ghost" @click.stop="deleteUser(row)" />
				</template>
			</KTable>
		</section>

		<!-- Add Building Modal -->
		<KModal
			v-model="showAddBuildingModal"
			title="Add New Building"
			size="large"
			@close="resetBuildingForm"
		>
			<form @submit.prevent="addBuilding">
				<div class="form-grid">
					<KInput
						v-model="newBuilding.name"
						label="Building Name"
						placeholder="e.g. Sakura Tower"
						required
					/>
					<KInput
						v-model="newBuilding.address"
						label="Address"
						placeholder="e.g. 1-2-3 Shibuya, Tokyo"
						required
					/>
				</div>

				<KTextarea
					v-model="newBuilding.description"
					label="Description"
					placeholder="Brief description of the building..."
					:rows="3"
				/>

				<div class="form-grid">
					<KInput
						v-model.number="newBuilding.units"
						type="number"
						label="Total Units"
						placeholder="120"
						:min="1"
					/>
					<KInput
						v-model.number="newBuilding.floors"
						type="number"
						label="Floors"
						placeholder="15"
						:min="1"
					/>
				</div>

				<div class="form-group">
					<label>Facilities</label>
					<div class="facilities-checkboxes">
						<label v-for="facility in availableFacilities" :key="facility.value" class="checkbox-label">
							<input v-model="newBuilding.facilities" type="checkbox" :value="facility.value">
							<span>{{ facility.label }}</span>
						</label>
					</div>
				</div>

				<KTextarea
					v-model="newBuilding.rules"
					label="Building Rules"
					placeholder="Enter building rules and regulations..."
					:rows="4"
				/>
			</form>

			<template #footer>
				<KButton variant="secondary" @click="showAddBuildingModal = false">Cancel</KButton>
				<KButton variant="primary" :loading="isAddingBuilding" @click="addBuilding">Save Building</KButton>
			</template>
		</KModal>
	</DashboardContainer>
</template>

<script>
// Store
import * as store from '../store'

export default {
	name: 'AdminDashboardRefactored',
	data() {
		return {
			// Navigation
			activeSection: 'overview',

			// Overview stats
			overviewStats: [
				{ id: 1, icon: '🏢', label: 'Buildings', value: 12, variant: 'primary', trend: { text: '+2 this month', positive: true } },
				{ id: 2, icon: '👥', label: 'Total Residents', value: 1248, variant: 'secondary', trend: { text: '+48 this month', positive: true } },
				{ id: 3, icon: '🔧', label: 'Open Requests', value: 23, variant: 'warning', trend: { text: '8 urgent', positive: false } },
				{ id: 4, icon: '💰', label: 'Monthly Revenue', value: 12500000, format: 'currency', variant: 'success', trend: { text: '+12%', positive: true } }
			],

			// Recent activities
			recentActivities: [
				{ id: 1, icon: '🔧', message: 'New maintenance request from Unit 502', time: '5 minutes ago' },
				{ id: 2, icon: '📅', message: 'Party Room booked for Dec 25', time: '1 hour ago' },
				{ id: 3, icon: '💳', message: '15 residents paid management fees', time: 'Today' }
			],

			// Menu items for sidebar
			menuItems: [
				{ id: 'overview', icon: '📊', label: 'Overview', translationKey: 'admin.menu.overview' },
				{ id: 'buildings', icon: '🏢', label: 'Buildings', translationKey: 'admin.menu.buildings' },
				{ id: 'users', icon: '👥', label: 'Users', translationKey: 'admin.menu.users' },
				{ id: 'maintenance', icon: '🔧', label: 'Maintenance', translationKey: 'admin.menu.maintenance' },
				{ id: 'financial', icon: '💰', label: 'Financial', translationKey: 'admin.menu.financial' },
				{ id: 'settings', icon: '⚙️', label: 'Settings', translationKey: 'admin.menu.settings' }
			],

			// Buildings data
			buildings: [
				{ id: 1, name: 'Sakura Tower', address: 'Shibuya, Tokyo', units: 120, occupancy: 95, status: 'active' },
				{ id: 2, name: 'Maple Heights', address: 'Shinjuku, Tokyo', units: 80, occupancy: 88, status: 'active' },
				{ id: 3, name: 'Ocean View', address: 'Minato, Tokyo', units: 200, occupancy: 92, status: 'active' }
			],

			// Users table configuration
			userColumns: [
				{ key: 'name', label: 'Name', sortable: true },
				{ key: 'email', label: 'Email', sortable: true },
				{ key: 'role', label: 'Role', sortable: true },
				{ key: 'building', label: 'Building', sortable: true },
				{ key: 'status', label: 'Status' },
				{ key: 'actions', label: 'Actions', width: '100px' }
			],

			users: [
				{ id: 1, name: 'Tanaka Yuki', email: 'tanaka@example.com', role: 'resident', building: 'Sakura Tower', status: 'active' },
				{ id: 2, name: 'Sato Kenji', email: 'sato@example.com', role: 'mansion_admin', building: 'Maple Heights', status: 'active' },
				{ id: 3, name: 'Yamada Hana', email: 'yamada@example.com', role: 'resident', building: 'Ocean View', status: 'active' }
			],

			// Building modal
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

			availableFacilities: [
				{ value: 'gym', label: 'Gym' },
				{ value: 'pool', label: 'Pool' },
				{ value: 'parking', label: 'Parking' },
				{ value: 'lounge', label: 'Lounge' },
				{ value: 'rooftop', label: 'Rooftop' },
				{ value: 'laundry', label: 'Laundry' }
			]
		}
	},
	computed: {
		// Computed properties for store
		user() {
			return store.user.value
		}
	},
	methods: {
		navigateToSection( section ) {
			this.activeSection = section
		},

		resetBuildingForm() {
			this.newBuilding = {
				name: '',
				address: '',
				description: '',
				units: null,
				floors: null,
				facilities: [],
				rules: ''
			}
		},

		async addBuilding() {
			if ( !this.newBuilding.name || !this.newBuilding.address ) {
				alert( 'Please fill in required fields' )
				return
			}

			this.isAddingBuilding = true

			// Simulate API call
			setTimeout( () => {
				this.buildings.push( {
					id: this.buildings.length + 1,
					name: this.newBuilding.name,
					address: this.newBuilding.address,
					units: this.newBuilding.units || 0,
					occupancy: 0,
					status: 'active'
				} )

				this.showAddBuildingModal = false
				this.resetBuildingForm()
				this.isAddingBuilding = false
				alert( 'Building added successfully!' )
			}, 1000 )
		},

		handleUserClick( user ) {
			console.log( 'User clicked:', user )
		},

		editUser( user ) {
			console.log( 'Edit user:', user )
		},

		deleteUser( user ) {
			if ( confirm( `Delete user ${user.name}?` ) ) {
				this.users = this.users.filter( u => u.id !== user.id )
			}
		},

		editBuilding( building ) {
			console.log( 'Edit building:', building )
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../styles/tokens.styl'

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

// Badges
.role-badge, .status-badge
	padding 0.25rem 0.5rem
	border-radius 12px
	font-size 0.85rem
	display inline-block

	&.resident
		background #E3F2FD
		color #2196F3

	&.mansion_admin
		background #FFF3E0
		color #FF9800

	&.active
		background #E8F5E9
		color #4CAF50

// Form styles
.form-grid
	display grid
	grid-template-columns 1fr 1fr
	gap 1rem

	@media (max-width: 600px)
		grid-template-columns 1fr

.form-group
	margin-bottom 1.2rem

	label
		display block
		margin-bottom 0.5rem
		color #666
		font-weight 500
		font-size 0.9rem

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
</style>