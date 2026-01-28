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
			<AdminOverviewSection
				v-if="activeSection === 'overview'"
				:stats="overviewStats"
				:recent-activities="recentActivities"
			/>

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

				<div v-if="isLoadingBuildings" class="loading-state">
					<p>{{ $t('common.loading') || 'Loading...' }}</p>
				</div>

				<div v-else-if="buildings.length === 0" class="empty-state">
					<p>{{ $t('admin.buildings.empty') || 'No buildings yet. Add your first building!' }}</p>
					<KButton variant="primary" @click="showAddBuildingModal = true">
						{{ $t('admin.buildings.add') }}
					</KButton>
				</div>

				<div v-else class="buildings-list">
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
							<p><strong>{{ $t('admin.buildings.address') }}:</strong> {{ building.address || '-' }}</p>
							<p><strong>{{ $t('admin.buildings.units') }}:</strong> {{ building.units || 0 }}</p>
							<p><strong>{{ $t('admin.buildings.occupancy') }}:</strong> {{ building.occupancy || 0 }}%</p>
						</div>
						<template #footer>
							<div class="building-actions">
								<KButton size="sm" variant="secondary" @click="openEditBuildingModal(building)">
									{{ $t('common.edit') }}
								</KButton>
								<KButton size="sm" variant="danger" @click="confirmDeleteBuilding(building)">
									{{ $t('common.delete') }}
								</KButton>
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
				>
					<template #actions>
						<KButton variant="primary" icon="➕" @click="openInviteUserModal">
							{{ $t('admin.users.invite') }}
						</KButton>
					</template>
				</SectionHeader>

				<div v-if="isLoadingUsers" class="loading-state">
					<p>{{ $t('common.loading') || 'Loading...' }}</p>
				</div>

				<div v-else-if="users.length === 0" class="empty-state">
					<p>{{ $t('admin.users.empty') || 'No users yet. Invite your first user!' }}</p>
					<KButton variant="primary" @click="openInviteUserModal">
						{{ $t('admin.users.invite') }}
					</KButton>
				</div>

				<KCard v-else elevated no-padding>
					<div class="users-table">
						<table>
							<thead>
								<tr>
									<th>{{ $t('admin.users.name') }}</th>
									<th>{{ $t('admin.users.email') }}</th>
									<th>{{ $t('admin.users.role') }}</th>
									<th>{{ $t('admin.users.building') }}</th>
									<th>{{ $t('admin.users.actions') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="u in users" :key="u.id">
									<td>{{ u.name || '-' }}</td>
									<td>{{ u.email }}</td>
									<td>
										<select
											:value="u.role"
											class="role-select"
											@change="updateUserRole(u.id, $event.target.value)"
										>
											<option v-for="role in roleOptions" :key="role.value" :value="role.value">
												{{ role.label }}
											</option>
										</select>
									</td>
									<td>{{ u.building }}</td>
									<td>
										<KButton
											size="xs"
											icon="🗑️"
											variant="ghost"
											@click="confirmDeleteUser(u)"
										/>
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

		<!-- Edit Building Modal -->
		<KModal
			v-model="showEditBuildingModal"
			:title="$t('admin.buildings.edit') || 'Edit Building'"
			size="medium"
		>
			<form v-if="editingBuilding" @submit.prevent="updateBuilding">
				<div class="form-group">
					<label for="edit-building-name">{{ $t('admin.buildings.name') }} *</label>
					<input
						id="edit-building-name"
						v-model="editingBuilding.name"
						type="text"
						required
					>
				</div>
				<div class="form-group">
					<label for="edit-building-address">{{ $t('admin.buildings.address') }} *</label>
					<input
						id="edit-building-address"
						v-model="editingBuilding.address"
						type="text"
						required
					>
				</div>
				<div class="form-group">
					<label for="edit-building-description">{{ $t('admin.buildings.description') }}</label>
					<textarea
						id="edit-building-description"
						v-model="editingBuilding.description"
						rows="3"
					/>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="edit-building-units">{{ $t('admin.buildings.totalUnits') }}</label>
						<input
							id="edit-building-units"
							v-model.number="editingBuilding.units"
							type="number"
							min="1"
						>
					</div>
					<div class="form-group">
						<label for="edit-building-floors">{{ $t('admin.buildings.floors') }}</label>
						<input
							id="edit-building-floors"
							v-model.number="editingBuilding.floors"
							type="number"
							min="1"
						>
					</div>
				</div>
			</form>

			<template #footer>
				<KButton variant="secondary" @click="showEditBuildingModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="primary" :loading="isEditingBuilding" @click="updateBuilding">
					{{ $t('common.save') }}
				</KButton>
			</template>
		</KModal>

		<!-- Invite User Modal -->
		<KModal
			v-model="showInviteUserModal"
			:title="$t('admin.users.inviteNew') || 'Invite User'"
			size="medium"
		>
			<form @submit.prevent="inviteUser">
				<div class="form-group">
					<label for="invite-email">{{ $t('admin.users.email') }} *</label>
					<input
						id="invite-email"
						v-model="newUser.email"
						type="email"
						required
						placeholder="user@example.com"
					>
				</div>
				<div class="form-group">
					<label for="invite-name">{{ $t('admin.users.name') }}</label>
					<input
						id="invite-name"
						v-model="newUser.name"
						type="text"
						placeholder="John Doe"
					>
				</div>
				<div class="form-group">
					<label for="invite-role">{{ $t('admin.users.role') }} *</label>
					<select id="invite-role" v-model="newUser.role" required>
						<option v-for="role in roleOptions" :key="role.value" :value="role.value">
							{{ role.label }}
						</option>
					</select>
				</div>
				<div class="form-group">
					<label for="invite-mansion">{{ $t('admin.users.building') }}</label>
					<select id="invite-mansion" v-model="newUser.mansionId">
						<option :value="null">{{ $t('common.none') || '-- None --' }}</option>
						<option v-for="building in buildings" :key="building.id" :value="building.id">
							{{ building.name }}
						</option>
					</select>
				</div>
				<p class="help-text">
					{{ $t('admin.users.inviteHelp') || 'An email with a magic link will be sent to this address.' }}
				</p>
			</form>

			<template #footer>
				<KButton variant="secondary" @click="showInviteUserModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="primary" :loading="isInvitingUser" @click="inviteUser">
					{{ $t('admin.users.sendInvite') || 'Send Invitation' }}
				</KButton>
			</template>
		</KModal>

		<!-- Delete Confirmation Modal -->
		<KModal
			v-model="showDeleteConfirm"
			:title="$t('common.confirmDelete') || 'Confirm Delete'"
			size="small"
		>
			<p v-if="deleteType === 'building'">
				{{ $t('admin.buildings.deleteConfirm') || 'Are you sure you want to delete this building?' }}
				<strong>{{ deleteTarget?.name }}</strong>
			</p>
			<p v-else-if="deleteType === 'user'">
				{{ $t('admin.users.deleteConfirm') || 'Are you sure you want to remove this user?' }}
				<strong>{{ deleteTarget?.email }}</strong>
			</p>

			<template #footer>
				<KButton variant="secondary" @click="cancelDelete">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="danger" :loading="isDeletingItem" @click="confirmDelete">
					{{ $t('common.delete') }}
				</KButton>
			</template>
		</KModal>
	</DashboardLayout>
</template>

<script>
import { ADMIN_MENU_ITEMS } from '../constants/dashboardMenus'
import backend from '../services/SupabaseBackend'
import * as store from '../store'

export default {
	name: 'AdminDashboard',
	data() {
		return {
			activeSection: 'overview',
			// Loading states
			isLoading: false,
			isLoadingBuildings: false,
			isLoadingUsers: false,
			// Modal states
			showAddBuildingModal: false,
			showEditBuildingModal: false,
			showInviteUserModal: false,
			showDeleteConfirm: false,
			// Form states
			isAddingBuilding: false,
			isEditingBuilding: false,
			isInvitingUser: false,
			isDeletingItem: false,
			// Building form
			newBuilding: {
				name: '',
				address: '',
				description: '',
				units: null,
				floors: null,
				facilities: [],
				rules: ''
			},
			editingBuilding: null,
			// User invitation form
			newUser: {
				email: '',
				name: '',
				role: 'mansion_admin',
				mansionId: null
			},
			// Delete confirmation
			deleteTarget: null,
			deleteType: null,
			// Menu config
			menuItems: ADMIN_MENU_ITEMS,
			// Data
			buildings: [],
			users: [],
			maintenanceRequests: [],
			buildingPayments: [],
			systemStats: null,
			// Error handling
			error: null
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
		},
		roleOptions() {
			return [
				{ value: 'admin', label: this.$t( 'roles.admin' ) || 'System Admin' },
				{ value: 'mansion_admin', label: this.$t( 'roles.mansionAdmin' ) || 'Building Admin' },
				{ value: 'manager', label: this.$t( 'roles.manager' ) || 'Manager' },
				{ value: 'resident', label: this.$t( 'roles.resident' ) || 'Resident' }
			]
		},
		overviewStats() {
			if ( !this.systemStats ) {
				return {
					buildings: this.buildings.length,
					residents: this.users.filter( u => u.role === 'resident' ).length,
					maintenance: 0,
					revenue: 0
				}
			}
			return {
				buildings: this.systemStats.buildings?.total || this.buildings.length,
				residents: this.systemStats.users?.residents || 0,
				maintenance: this.systemStats.maintenance?.pending || 0,
				revenue: this.systemStats.revenue?.total || 0
			}
		},
		recentActivities() {
			// Combine recent data into activity items
			const activities = []
			// Add recent buildings
			this.buildings.slice( 0, 2 ).forEach( b => {
				activities.push( {
					id: `building-${b.id}`,
					icon: '🏢',
					text: `Building "${b.name}" registered`,
					time: this.formatTimeAgo( b.createdAt )
				} )
			} )
			// Add recent users
			this.users.slice( 0, 2 ).forEach( u => {
				activities.push( {
					id: `user-${u.id}`,
					icon: '👤',
					text: `${u.name || u.email} joined as ${u.role}`,
					time: this.formatTimeAgo( u.createdAt )
				} )
			} )
			return activities.slice( 0, 5 )
		}
	},
	watch: {
		activeSection( newSection ) {
			this.$nextTick( () => {
				document.querySelector( '#app' )?.scrollTo( 0, 0 )
			} )
			// Load data for the section
			if ( newSection === 'buildings' ) this.fetchBuildings()
			if ( newSection === 'users' ) this.fetchUsers()
		}
	},
	async mounted() {
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
			return
		}

		// Load initial data
		await this.loadInitialData()
	},
	methods: {
		navigateToSection( section ) {
			this.activeSection = section
		},

		// ==========================================
		// DATA LOADING
		// ==========================================

		async loadInitialData() {
			this.isLoading = true
			try {
				await Promise.all( [
					this.fetchBuildings(),
					this.fetchUsers(),
					this.fetchSystemStats()
				] )
			} catch ( error ) {
				console.error( 'Failed to load initial data:', error )
				this.error = 'Failed to load data'
			} finally {
				this.isLoading = false
			}
		},

		async fetchBuildings() {
			this.isLoadingBuildings = true
			try {
				const response = await backend.getMansions()
				if ( response.success ) {
					this.buildings = response.data.map( b => ( {
						...b,
						units: b.totalUnits || 0,
						status: 'active',
						occupancy: 85 // TODO: Calculate from actual resident count
					} ) )
				}
			} catch ( error ) {
				console.error( 'Failed to fetch buildings:', error )
			} finally {
				this.isLoadingBuildings = false
			}
		},

		async fetchUsers() {
			this.isLoadingUsers = true
			try {
				const response = await backend.getUsers()
				if ( response.success ) {
					this.users = response.data.map( u => ( {
						...u,
						building: u.mansionName || '-',
						status: 'active'
					} ) )
				}
			} catch ( error ) {
				console.error( 'Failed to fetch users:', error )
			} finally {
				this.isLoadingUsers = false
			}
		},

		async fetchSystemStats() {
			try {
				const response = await backend.getSystemStats()
				if ( response.success ) {
					this.systemStats = response.data
				}
			} catch ( error ) {
				console.error( 'Failed to fetch system stats:', error )
			}
		},

		// ==========================================
		// BUILDING CRUD
		// ==========================================

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
			this.isAddingBuilding = true
			try {
				const payload = {
					name: this.newBuilding.name,
					address: this.newBuilding.address,
					totalUnits: this.newBuilding.units || 0,
					settings: {
						description: this.newBuilding.description,
						floors: this.newBuilding.floors,
						rules: this.newBuilding.rules
					},
					metadata: {
						facilities: this.newBuilding.facilities
					}
				}

				const response = await backend.create( 'mansions', payload )
				if ( response.success ) {
					this.showAddBuildingModal = false
					this.resetBuildingForm()
					await this.fetchBuildings()
				}
			} catch ( error ) {
				console.error( 'Failed to add building:', error )
				this.error = error.error?.message || 'Failed to add building'
			} finally {
				this.isAddingBuilding = false
			}
		},

		openEditBuildingModal( building ) {
			this.editingBuilding = {
				id: building.id,
				name: building.name,
				address: building.address,
				description: building.settings?.description || '',
				units: building.totalUnits || building.units,
				floors: building.settings?.floors || null,
				facilities: building.metadata?.facilities || [],
				rules: building.settings?.rules || ''
			}
			this.showEditBuildingModal = true
		},

		async updateBuilding() {
			if ( !this.editingBuilding ) return
			this.isEditingBuilding = true
			try {
				const payload = {
					name: this.editingBuilding.name,
					address: this.editingBuilding.address,
					totalUnits: this.editingBuilding.units || 0,
					settings: {
						description: this.editingBuilding.description,
						floors: this.editingBuilding.floors,
						rules: this.editingBuilding.rules
					},
					metadata: {
						facilities: this.editingBuilding.facilities
					}
				}

				const response = await backend.update( 'mansions', this.editingBuilding.id, payload )
				if ( response.success ) {
					this.showEditBuildingModal = false
					this.editingBuilding = null
					await this.fetchBuildings()
				}
			} catch ( error ) {
				console.error( 'Failed to update building:', error )
				this.error = error.error?.message || 'Failed to update building'
			} finally {
				this.isEditingBuilding = false
			}
		},

		confirmDeleteBuilding( building ) {
			this.deleteTarget = building
			this.deleteType = 'building'
			this.showDeleteConfirm = true
		},

		async deleteBuilding() {
			if ( !this.deleteTarget ) return
			this.isDeletingItem = true
			try {
				const response = await backend.delete( 'mansions', this.deleteTarget.id )
				if ( response.success ) {
					this.showDeleteConfirm = false
					this.deleteTarget = null
					this.deleteType = null
					await this.fetchBuildings()
				}
			} catch ( error ) {
				console.error( 'Failed to delete building:', error )
				this.error = error.error?.message || 'Failed to delete building'
			} finally {
				this.isDeletingItem = false
			}
		},

		// ==========================================
		// USER MANAGEMENT
		// ==========================================

		openInviteUserModal() {
			this.newUser = {
				email: '',
				name: '',
				role: 'mansion_admin',
				mansionId: this.buildings[0]?.id || null
			}
			this.showInviteUserModal = true
		},

		async inviteUser() {
			this.isInvitingUser = true
			try {
				const response = await backend.inviteUser( {
					email: this.newUser.email,
					name: this.newUser.name,
					role: this.newUser.role,
					mansionId: this.newUser.mansionId
				} )
				if ( response.success ) {
					this.showInviteUserModal = false
					this.newUser = { email: '', name: '', role: 'mansion_admin', mansionId: null }
					// User will appear after they accept invitation
					alert( this.$t( 'admin.users.inviteSent' ) || 'Invitation sent successfully!' )
				}
			} catch ( error ) {
				console.error( 'Failed to invite user:', error )
				this.error = error.error?.message || 'Failed to send invitation'
				alert( this.error )
			} finally {
				this.isInvitingUser = false
			}
		},

		async updateUserRole( userId, newRole ) {
			try {
				const response = await backend.updateUser( userId, { role: newRole } )
				if ( response.success ) {
					await this.fetchUsers()
				}
			} catch ( error ) {
				console.error( 'Failed to update user role:', error )
			}
		},

		confirmDeleteUser( user ) {
			this.deleteTarget = user
			this.deleteType = 'user'
			this.showDeleteConfirm = true
		},

		async deleteUser() {
			if ( !this.deleteTarget ) return
			this.isDeletingItem = true
			try {
				const response = await backend.deleteUser( this.deleteTarget.id )
				if ( response.success ) {
					this.showDeleteConfirm = false
					this.deleteTarget = null
					this.deleteType = null
					await this.fetchUsers()
				}
			} catch ( error ) {
				console.error( 'Failed to delete user:', error )
				this.error = error.error?.message || 'Failed to delete user'
			} finally {
				this.isDeletingItem = false
			}
		},

		cancelDelete() {
			this.showDeleteConfirm = false
			this.deleteTarget = null
			this.deleteType = null
		},

		async confirmDelete() {
			if ( this.deleteType === 'building' ) {
				await this.deleteBuilding()
			} else if ( this.deleteType === 'user' ) {
				await this.deleteUser()
			}
		},

		formatTimeAgo( dateString ) {
			if ( !dateString ) return 'Recently'
			const date = new Date( dateString )
			const now = new Date()
			const diffMs = now - date
			const diffMins = Math.floor( diffMs / 60000 )
			const diffHours = Math.floor( diffMs / 3600000 )
			const diffDays = Math.floor( diffMs / 86400000 )

			if ( diffMins < 1 ) return 'Just now'
			if ( diffMins < 60 ) return `${diffMins} min ago`
			if ( diffHours < 24 ) return `${diffHours} hours ago`
			if ( diffDays < 7 ) return `${diffDays} days ago`
			return date.toLocaleDateString()
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

// Loading and empty states
.loading-state, .empty-state
	text-align center
	padding 3rem
	color #666

	p
		margin-bottom 1rem

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

.role-select
	padding 0.5rem
	border 1px solid #e0e0e0
	border-radius 8px
	background white
	font-size 0.9rem
	cursor pointer

	&:focus
		outline none
		border-color $color-primary

.help-text
	color #666
	font-size 0.9rem
	margin-top 1rem
	padding 0.75rem
	background #f5f5f5
	border-radius 8px

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
