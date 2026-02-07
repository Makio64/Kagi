<template>
	<DashboardLayout
		:title="$t('admin.title')"
		:user-email="user?.email || 'Admin'"
		user-role="System Administrator"
		:menu-items="menuItemsWithLabels"
		:active-section="activeSection"
		@navigate="navigateToSection"
		@logout="handleLogout"
		@logo-click="navigateToSection('overview')"
	>
		<div class="admin-dashboard-content">
			<!-- Overview Section -->
			<AdminOverviewSection
				v-if="activeSection === 'overview'"
				:stats="overviewStats"
				:trends="overviewTrends"
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
					<p>{{ $t('admin.buildings.empty') }}</p>
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
						hoverable
						clickable
						@click="openBuildingDetail(building)"
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
								<KButton size="sm" variant="secondary" @click.stop="openEditBuildingModal(building)">
									{{ $t('common.edit') }}
								</KButton>
								<KButton size="sm" variant="danger" @click.stop="confirmDeleteBuilding(building)">
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

				<!-- Filter Bar -->
				<div class="users-filter-bar">
					<div class="filter-search">
						<input
							v-model="userFilters.search"
							type="search"
							class="search-input"
							:placeholder="$t('admin.users.searchPlaceholder')"
							@input="handleUserSearch($event.target.value)"
						>
					</div>

					<div class="filter-group">
						<label class="filter-label">{{ $t('admin.users.role') }}</label>
						<select
							v-model="userFilters.role"
							class="filter-select"
							@change="handleRoleFilter(userFilters.role)"
						>
							<option :value="null">{{ $t('admin.users.allRoles') }}</option>
							<option v-for="role in roleOptions" :key="role.value" :value="role.value">
								{{ role.label }}
							</option>
						</select>
					</div>

					<div class="filter-group">
						<label class="filter-label">{{ $t('admin.users.building') }}</label>
						<select
							v-model="userFilters.mansionId"
							class="filter-select"
							@change="handleBuildingFilter(userFilters.mansionId)"
						>
							<option :value="null">{{ $t('admin.users.allBuildings') }}</option>
							<option v-for="building in buildings" :key="building.id" :value="building.id">
								{{ building.name }}
							</option>
						</select>
					</div>

					<KButton
						v-if="hasActiveFilters"
						variant="ghost"
						size="sm"
						@click="clearUserFilters"
					>
						{{ $t('admin.users.clearFilters') }}
					</KButton>
				</div>

				<!-- Results Count -->
				<div v-if="userPagination.total > 0" class="users-results-info">
					<span class="results-count">
						{{ $t('admin.users.showingResults', { start: userResultsStart, end: userResultsEnd, total: userPagination.total }) }}
					</span>
				</div>

				<div v-if="isLoadingUsers" class="loading-state">
					<p>{{ $t('common.loading') }}</p>
				</div>

				<div v-else-if="users.length === 0" class="empty-state">
					<p v-if="hasActiveFilters">{{ $t('admin.users.noResults') }}</p>
					<p v-else>{{ $t('admin.users.empty') }}</p>
					<KButton v-if="!hasActiveFilters" variant="primary" @click="openInviteUserModal">
						{{ $t('admin.users.invite') }}
					</KButton>
				</div>

				<KCard v-else elevated no-padding>
					<div class="users-table">
						<table>
							<thead>
								<tr>
									<th class="sortable-header" @click="handleUserSort('name')">
										{{ $t('admin.users.name') }}
										<span v-if="userSort === 'name' || userSort === '-name'" class="sort-indicator">
											{{ userSort === 'name' ? '▲' : '▼' }}
										</span>
									</th>
									<th class="sortable-header" @click="handleUserSort('email')">
										{{ $t('admin.users.email') }}
										<span v-if="userSort === 'email' || userSort === '-email'" class="sort-indicator">
											{{ userSort === 'email' ? '▲' : '▼' }}
										</span>
									</th>
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
									<td class="actions-cell">
										<button class="action-btn" @click="openEditUserModal(u)">
											✏️ {{ $t('common.edit') }}
										</button>
										<button class="action-btn action-btn--danger" @click="confirmDeleteUser(u)">
											🗑️ {{ $t('common.delete') }}
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<!-- Pagination -->
					<div v-if="userPagination.totalPages > 1" class="pagination">
						<KButton
							size="sm"
							variant="secondary"
							:disabled="userPagination.page === 1"
							@click="handleUserPageChange(userPagination.page - 1)"
						>
							{{ $t('common.previous') }}
						</KButton>

						<span class="pagination-info">
							{{ $t('common.pageOf', { current: userPagination.page, total: userPagination.totalPages }) }}
						</span>

						<KButton
							size="sm"
							variant="secondary"
							:disabled="userPagination.page >= userPagination.totalPages"
							@click="handleUserPageChange(userPagination.page + 1)"
						>
							{{ $t('common.next') }}
						</KButton>
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
						:value="maintenanceStats.urgent"
						variant="danger"
					/>
					<StatCard
						icon="⏳"
						:label="$t('admin.maintenance.pending')"
						:value="maintenanceStats.pending"
						variant="warning"
					/>
					<StatCard
						icon="🔧"
						:label="$t('admin.maintenance.inProgress')"
						:value="maintenanceStats.inProgress"
						variant="info"
					/>
					<StatCard
						icon="✅"
						:label="$t('admin.maintenance.completed')"
						:value="maintenanceStats.completed"
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
						:value="financialStats.revenue"
						format="currency"
						:subtext="$t('admin.financial.collected')"
						variant="primary"
					/>
					<StatCard
						icon="⏳"
						:label="$t('admin.financial.pending')"
						:value="financialStats.pending"
						format="currency"
						:subtext="$t('admin.financial.outstanding')"
						variant="warning"
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

			<!-- Building Detail Section -->
			<section v-if="activeSection === 'building-detail'" class="section">
				<BuildingDetailSection
					v-if="selectedBuilding"
					:building="selectedBuilding"
					:users="buildingUsers"
					:loading="isLoadingBuildingUsers"
					:role-options="roleOptions"
					:is-saving="isEditingBuilding"
					:is-inviting="isInvitingUser"
					:is-adding-user="isAddingExistingUser"
					@back="goBackToBuildings"
					@update-building="handleUpdateBuilding"
					@invite-user="handleInviteUserToBuilding"
					@add-existing-user="handleAddExistingUser"
					@update-user="handleUpdateBuildingUser"
					@edit-user="openEditUserModal"
					@delete-user="confirmDeleteUser"
				/>
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
					<label for="building-tier">{{ $t('admin.buildings.subscriptionTier') }}</label>
					<select id="building-tier" v-model="newBuilding.subscriptionTier">
						<option value="standard">{{ $t('admin.buildings.standard') }} (¥100/unit)</option>
						<option value="professional">{{ $t('admin.buildings.professional') }} (¥300/unit)</option>
					</select>
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
				<div class="form-group">
					<label for="edit-building-tier">{{ $t('admin.buildings.subscriptionTier') }}</label>
					<select id="edit-building-tier" v-model="editingBuilding.subscriptionTier">
						<option value="standard">{{ $t('admin.buildings.standard') }} (¥100/unit)</option>
						<option value="professional">{{ $t('admin.buildings.professional') }} (¥300/unit)</option>
					</select>
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

		<!-- Edit User Modal -->
		<KModal
			v-model="showEditUserModal"
			:title="$t('admin.users.editUser')"
		>
			<form class="modal-form" @submit.prevent="saveEditUser">
				<div class="form-group">
					<label>{{ $t('admin.users.email') }}</label>
					<input
						type="email"
						:value="editingUser?.email"
						disabled
						class="input-disabled"
					>
				</div>
				<div class="form-group">
					<label for="edit-name">{{ $t('admin.users.name') }}</label>
					<input
						id="edit-name"
						v-model="editUserForm.name"
						type="text"
						:placeholder="$t('admin.users.name')"
					>
				</div>
				<div class="form-group">
					<label for="edit-mansion">{{ $t('admin.users.building') }}</label>
					<select id="edit-mansion" v-model="editUserForm.mansionId">
						<option :value="null">{{ $t('admin.users.noBuilding') }}</option>
						<option v-for="building in buildings" :key="building.id" :value="building.id">
							{{ building.name }}
						</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-unit">{{ $t('admin.users.unit') }}</label>
					<input
						id="edit-unit"
						v-model="editUserForm.unit"
						type="text"
						:placeholder="$t('admin.users.unitPlaceholder')"
					>
				</div>
				<div class="form-group">
					<label for="edit-phone">{{ $t('admin.users.phone') }}</label>
					<input
						id="edit-phone"
						v-model="editUserForm.phone"
						type="tel"
						:placeholder="$t('admin.users.phonePlaceholder')"
					>
				</div>
			</form>

			<template #footer>
				<KButton variant="secondary" @click="showEditUserModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="primary" :loading="isEditingUser" @click="saveEditUser">
					{{ $t('common.save') }}
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
			showEditUserModal: false,
			showDeleteConfirm: false,
			// Form states
			isAddingBuilding: false,
			isEditingBuilding: false,
			isInvitingUser: false,
			isEditingUser: false,
			isDeletingItem: false,
			// Building form
			newBuilding: {
				name: '',
				address: '',
				description: '',
				units: null,
				floors: null,
				facilities: [],
				rules: '',
				subscriptionTier: 'standard'
			},
			editingBuilding: null,
			// User invitation form
			newUser: {
				email: '',
				name: '',
				role: 'mansion_admin',
				mansionId: null
			},
			// User edit form
			editingUser: null,
			editUserForm: {
				name: '',
				mansionId: null,
				unit: '',
				phone: ''
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
			// User filters
			userFilters: {
				search: '',
				role: null,
				mansionId: null
			},
			userPagination: {
				page: 1,
				limit: 25,
				total: 0,
				totalPages: 0
			},
			userSort: '-createdAt',
			searchTimeout: null,
			// Error handling
			error: null,
			// Building detail section
			selectedBuilding: null,
			buildingUsers: [],
			isLoadingBuildingUsers: false,
			isAddingExistingUser: false
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
				label: this.$t( `admin.menu.${item.id}` )
			} ) )
		},
		roleOptions() {
			return [
				{ value: 'admin', label: this.$t( 'roles.admin' ) },
				{ value: 'mansion_admin', label: this.$t( 'roles.mansionAdmin' ) },
				{ value: 'manager', label: this.$t( 'roles.manager' ) },
				{ value: 'resident', label: this.$t( 'roles.resident' ) }
			]
		},
		hasActiveFilters() {
			return this.userFilters.search || this.userFilters.role || this.userFilters.mansionId
		},
		userResultsStart() {
			return ( ( this.userPagination.page - 1 ) * this.userPagination.limit ) + 1
		},
		userResultsEnd() {
			return Math.min( this.userPagination.page * this.userPagination.limit, this.userPagination.total )
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
		},
		overviewTrends() {
			const stats = this.systemStats
			if ( !stats ) {
				return {
					buildings: { text: '', positive: true },
					residents: { text: '', positive: true },
					maintenance: { text: '', positive: false },
					revenue: { text: '', positive: true }
				}
			}
			const buildingsThisMonth = stats.buildings?.thisMonth || 0
			const residentsThisMonth = stats.users?.residentsThisMonth || 0
			const urgentCount = stats.maintenance?.urgent || 0
			const percentChange = stats.revenue?.percentChange || 0

			return {
				buildings: {
					text: buildingsThisMonth > 0 ? `+${buildingsThisMonth} ${this.$t( 'admin.trends.thisMonth' )}` : '',
					positive: true
				},
				residents: {
					text: residentsThisMonth > 0 ? `+${residentsThisMonth} ${this.$t( 'admin.trends.thisMonth' )}` : '',
					positive: true
				},
				maintenance: {
					text: urgentCount > 0 ? `${urgentCount} ${this.$t( 'admin.trends.urgent' )}` : '',
					positive: false
				},
				revenue: {
					text: percentChange !== 0 ? `${percentChange > 0 ? '+' : ''}${percentChange}%` : '',
					positive: percentChange >= 0
				}
			}
		},
		maintenanceStats() {
			return {
				urgent: this.systemStats?.maintenance?.urgent || 0,
				pending: this.systemStats?.maintenance?.pending || 0,
				inProgress: this.systemStats?.maintenance?.inProgress || 0,
				completed: this.systemStats?.maintenance?.completed || 0
			}
		},
		financialStats() {
			return {
				revenue: this.systemStats?.revenue?.total || 0,
				pending: this.systemStats?.revenue?.pending || 0
			}
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
			// Note: building-detail data is loaded via openBuildingDetail()
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

		async handleLogout() {
			await store.logout()
			this.$router.push( '/login' )
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
						subscriptionTier: b.subscriptionTier || 'standard',
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
				const response = await backend.getUsers( {
					search: this.userFilters.search || undefined,
					role: this.userFilters.role || undefined,
					mansionId: this.userFilters.mansionId || undefined,
					page: this.userPagination.page,
					limit: this.userPagination.limit,
					sort: this.userSort
				} )
				if ( response.success ) {
					this.users = response.data.map( u => ( {
						...u,
						building: u.mansionName || '-',
						status: 'active'
					} ) )
					// Update pagination from response
					this.userPagination.total = response.meta.total
					this.userPagination.totalPages = response.meta.totalPages
				}
			} catch ( error ) {
				console.error( 'Failed to fetch users:', error )
			} finally {
				this.isLoadingUsers = false
			}
		},

		// User filter methods
		handleUserSearch( value ) {
			this.userFilters.search = value
			if ( this.searchTimeout ) {
				clearTimeout( this.searchTimeout )
			}
			this.searchTimeout = setTimeout( () => {
				this.userPagination.page = 1
				this.fetchUsers()
			}, 300 )
		},

		handleRoleFilter( role ) {
			this.userFilters.role = role
			this.userPagination.page = 1
			this.fetchUsers()
		},

		handleBuildingFilter( mansionId ) {
			this.userFilters.mansionId = mansionId
			this.userPagination.page = 1
			this.fetchUsers()
		},

		handleUserSort( field ) {
			if ( this.userSort === field ) {
				this.userSort = `-${field}`
			} else if ( this.userSort === `-${field}` ) {
				this.userSort = field
			} else {
				this.userSort = `-${field}`
			}
			this.fetchUsers()
		},

		handleUserPageChange( page ) {
			this.userPagination.page = page
			this.fetchUsers()
		},

		clearUserFilters() {
			this.userFilters = {
				search: '',
				role: null,
				mansionId: null
			}
			this.userPagination.page = 1
			this.fetchUsers()
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
				rules: '',
				subscriptionTier: 'standard'
			}
		},

		async addBuilding() {
			this.isAddingBuilding = true
			try {
				const payload = {
					name: this.newBuilding.name,
					address: this.newBuilding.address,
					totalUnits: this.newBuilding.units || 0,
					subscriptionTier: this.newBuilding.subscriptionTier || 'standard',
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
				rules: building.settings?.rules || '',
				subscriptionTier: building.subscriptionTier || 'standard'
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
					subscriptionTier: this.editingBuilding.subscriptionTier || 'standard',
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

		// ==========================================
		// BUILDING DETAIL SECTION
		// ==========================================

		openBuildingDetail( building ) {
			this.selectedBuilding = building
			this.activeSection = 'building-detail'
			this.fetchBuildingUsers( building.id )
		},

		async fetchBuildingUsers( mansionId ) {
			this.isLoadingBuildingUsers = true
			try {
				const response = await backend.getUsers( { mansionId } )
				if ( response.success ) {
					this.buildingUsers = response.data
						.filter( u => u.role !== 'admin' )
						.map( u => ( {
							...u,
							building: u.mansionName || '-',
							status: 'active'
						} ) )
				}
			} catch ( error ) {
				console.error( 'Failed to fetch building users:', error )
			} finally {
				this.isLoadingBuildingUsers = false
			}
		},

		goBackToBuildings() {
			this.selectedBuilding = null
			this.buildingUsers = []
			this.activeSection = 'buildings'
		},

		async handleUpdateBuilding( buildingData ) {
			this.isEditingBuilding = true
			try {
				const payload = {
					name: buildingData.name,
					address: buildingData.address,
					totalUnits: buildingData.units || 0,
					subscriptionTier: buildingData.subscriptionTier || 'standard',
					settings: {
						description: buildingData.description,
						floors: buildingData.floors,
						rules: buildingData.rules
					},
					metadata: {
						facilities: buildingData.facilities
					}
				}
				const response = await backend.update( 'mansions', buildingData.id, payload )
				if ( response.success ) {
					// Update the selected building with new data
					this.selectedBuilding = {
						...this.selectedBuilding,
						name: buildingData.name,
						address: buildingData.address,
						totalUnits: buildingData.units,
						units: buildingData.units,
						subscriptionTier: buildingData.subscriptionTier,
						settings: payload.settings,
						metadata: payload.metadata
					}
					await this.fetchBuildings() // Refresh buildings list
				}
			} catch ( error ) {
				console.error( 'Failed to update building:', error )
				this.error = error.error?.message || 'Failed to update building'
				alert( this.error )
			} finally {
				this.isEditingBuilding = false
			}
		},

		async handleInviteUserToBuilding( userData ) {
			this.isInvitingUser = true
			try {
				const response = await backend.inviteUser( {
					email: userData.email,
					name: userData.name,
					role: userData.role,
					mansionId: userData.mansionId,
					unit: userData.unit
				} )
				if ( response.success ) {
					alert( this.$t( 'admin.users.inviteSent' ) || 'Invitation sent successfully!' )
					// Note: User will appear in list after they accept the invitation
				}
			} catch ( error ) {
				console.error( 'Failed to invite user:', error )
				alert( error.error?.message || 'Failed to send invitation' )
			} finally {
				this.isInvitingUser = false
			}
		},

		async handleUpdateBuildingUser( updateData ) {
			try {
				const response = await backend.updateUser( updateData.userId, { role: updateData.role } )
				if ( response.success ) {
					await this.fetchBuildingUsers( this.selectedBuilding.id )
				}
			} catch ( error ) {
				console.error( 'Failed to update user:', error )
			}
		},

		async handleAddExistingUser( data ) {
			this.isAddingExistingUser = true
			try {
				const response = await backend.updateUser( data.userId, { mansionId: data.mansionId } )
				if ( response.success ) {
					alert( this.$t( 'admin.users.addedToBuilding' ) || 'User added to building successfully!' )
					await this.fetchBuildingUsers( this.selectedBuilding.id )
				}
			} catch ( error ) {
				console.error( 'Failed to add user to building:', error )
				alert( error.error?.message || 'Failed to add user to building' )
			} finally {
				this.isAddingExistingUser = false
			}
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

		openEditUserModal( user ) {
			this.editingUser = user
			this.editUserForm = {
				name: user.name || '',
				mansionId: user.mansionId || null,
				unit: user.unit || '',
				phone: user.phone || ''
			}
			this.showEditUserModal = true
		},

		async saveEditUser() {
			if ( !this.editingUser ) return
			this.isEditingUser = true
			try {
				const response = await backend.updateUser( this.editingUser.id, {
					name: this.editUserForm.name,
					mansionId: this.editUserForm.mansionId,
					unit: this.editUserForm.unit,
					phone: this.editUserForm.phone
				} )
				if ( response.success ) {
					this.showEditUserModal = false
					this.editingUser = null
					await this.fetchUsers()
				}
			} catch ( error ) {
				console.error( 'Failed to update user:', error )
				this.error = error.error?.message || 'Failed to update user'
				alert( this.error )
			} finally {
				this.isEditingUser = false
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
	grid-template-columns repeat(auto-fit, minmax(280px, 1fr))
	gap 1.5rem
	margin-bottom 2rem

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

// User filter bar
.users-filter-bar
	display flex
	flex-wrap wrap
	align-items flex-end
	gap 1rem
	margin-bottom 1.5rem
	padding 1rem 1.5rem
	background $color-bg-tertiary
	border-radius $radius-lg

	@media (max-width: 768px)
		flex-direction column
		align-items stretch

.filter-search
	flex 1
	min-width 250px

	.search-input
		width 100%
		padding 0.75rem 1rem 0.75rem 2.5rem
		border 1px solid $color-border
		border-radius $radius-pill
		font-size 0.95rem
		background-image url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")
		background-repeat no-repeat
		background-position 0.75rem center
		transition border-color 0.2s

		&:focus
			outline none
			border-color $color-primary
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.15)

		&::placeholder
			color $color-text-tertiary

.filter-group
	display flex
	flex-direction column
	gap 0.25rem
	min-width 150px

.filter-label
	font-size 0.8rem
	color $color-text-secondary
	font-weight 500

.filter-select
	padding 0.6rem 2rem 0.6rem 0.75rem
	border 1px solid $color-border
	border-radius $radius-md
	font-size 0.95rem
	background white
	cursor pointer
	appearance none
	background-image url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")
	background-repeat no-repeat
	background-position right 0.75rem center
	transition border-color 0.2s

	&:focus
		outline none
		border-color $color-primary

.users-results-info
	margin-bottom 1rem

	.results-count
		font-size 0.9rem
		color $color-text-secondary

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

// Sortable headers
.sortable-header
	cursor pointer
	user-select none
	transition background 0.2s

	&:hover
		background rgba(255, 193, 7, 0.1)

	.sort-indicator
		margin-left 0.5rem
		font-size 0.75rem
		color $color-primary

// Pagination
.pagination
	display flex
	justify-content center
	align-items center
	gap 1rem
	padding 1rem
	border-top 1px solid $color-border

	.pagination-info
		font-size 0.9rem
		color $color-text-secondary

// Actions cell
.actions-cell
	display flex
	gap 0.25rem
	flex-wrap wrap

.action-btn
	padding 0.35rem 0.6rem
	font-size 0.8rem
	border none
	border-radius 6px
	background transparent
	color #666
	cursor pointer
	transition all 0.2s
	white-space nowrap

	&:hover
		background #f0f0f0
		color #333

	&--danger:hover
		background #ffebee
		color #d32f2f

// Disabled input
.input-disabled
	background #f5f5f5
	color #999
	cursor not-allowed

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
