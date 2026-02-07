<template>
	<DashboardLayout
		:title="buildingName"
		:user-email="user?.email || 'Mansion Admin'"
		user-role="Mansion Administrator"
		:menu-items="menuItemsWithLabels"
		:active-section="activeSection"
		@navigate="navigateToSection"
		@logout="handleLogout"
		@logo-click="navigateToSection('residents')"
	>
		<!-- Residents Section -->
		<MansionResidentsSection
			:residents="residents"
			:loading="isLoadingResidents"
			:stats="residentsStats"
			:pagination="residentPagination"
			:sort="residentSort"
			:search="residentFilters.search"
			@add="openInviteResidentModal"
			@edit="openEditResidentModal"
			@delete="confirmDeleteResident"
			@search="handleResidentSearch"
			@sort="handleResidentSort"
			@page-change="handleResidentPageChange"
		/>

		<!-- Invite Resident Modal -->
		<KModal
			v-model="showInviteResidentModal"
			:title="$t('mansion.residents.invite') || 'Invite Resident'"
			size="medium"
		>
			<form @submit.prevent="inviteResident">
				<div class="form-group">
					<label for="resident-email">{{ $t('common.email') || 'Email' }} *</label>
					<input
						id="resident-email"
						v-model="newResident.email"
						type="email"
						required
						placeholder="resident@example.com"
					>
				</div>
				<div class="form-group">
					<label for="resident-name">{{ $t('common.name') || 'Name' }}</label>
					<input
						id="resident-name"
						v-model="newResident.name"
						type="text"
						placeholder="John Doe"
					>
				</div>
				<div class="form-group">
					<label for="resident-unit">{{ $t('mansion.residents.unit') || 'Unit Number' }} *</label>
					<input
						id="resident-unit"
						v-model="newResident.unit"
						type="text"
						required
						placeholder="e.g. 1201"
					>
				</div>
				<div class="form-group">
					<label for="resident-phone">{{ $t('common.phone') || 'Phone' }}</label>
					<input
						id="resident-phone"
						v-model="newResident.phone"
						type="tel"
						placeholder="+81-90-1234-5678"
					>
				</div>
				<p class="help-text">
					{{ $t('mansion.residents.inviteHelp') || 'An email with a magic link will be sent to invite the resident.' }}
				</p>
			</form>

			<template #footer>
				<KButton variant="secondary" @click="showInviteResidentModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="primary" :loading="isInvitingResident" @click="inviteResident">
					{{ $t('common.sendInvite') || 'Send Invitation' }}
				</KButton>
			</template>
		</KModal>

		<!-- Edit Resident Modal -->
		<KModal
			v-model="showEditResidentModal"
			:title="$t('mansion.residents.editResident') || 'Edit Resident'"
		>
			<form class="modal-form" @submit.prevent="saveEditResident">
				<div class="form-group">
					<label>{{ $t('common.email') || 'Email' }}</label>
					<input
						type="email"
						:value="editingResident?.email"
						disabled
						class="input-disabled"
					>
				</div>
				<div class="form-group">
					<label for="edit-name">{{ $t('common.name') || 'Name' }}</label>
					<input
						id="edit-name"
						v-model="editResidentForm.name"
						type="text"
						:placeholder="$t('common.name') || 'Name'"
					>
				</div>
				<div class="form-group">
					<label for="edit-unit">{{ $t('mansion.residents.unit') || 'Unit Number' }}</label>
					<input
						id="edit-unit"
						v-model="editResidentForm.unit"
						type="text"
						placeholder="e.g. 1201"
					>
				</div>
				<div class="form-group">
					<label for="edit-phone">{{ $t('common.phone') || 'Phone' }}</label>
					<input
						id="edit-phone"
						v-model="editResidentForm.phone"
						type="tel"
						placeholder="+81-90-1234-5678"
					>
				</div>
			</form>

			<template #footer>
				<KButton variant="secondary" @click="showEditResidentModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="primary" :loading="isEditingResident" @click="saveEditResident">
					{{ $t('common.save') || 'Save' }}
				</KButton>
			</template>
		</KModal>

		<!-- Delete Confirmation Modal -->
		<KModal
			v-model="showDeleteConfirm"
			:title="$t('common.confirmDelete') || 'Confirm Delete'"
			size="small"
		>
			<p>
				{{ $t('mansion.residents.deleteConfirm') || 'Are you sure you want to remove this resident?' }}
				<strong>{{ deleteTarget?.email }}</strong>
			</p>

			<template #footer>
				<KButton variant="secondary" @click="cancelDelete">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="danger" :loading="isDeletingResident" @click="deleteResident">
					{{ $t('common.delete') || 'Delete' }}
				</KButton>
			</template>
		</KModal>
	</DashboardLayout>
</template>
<script>
import { MANSION_ADMIN_MENU_ITEMS } from '../constants/dashboardMenus'
import backend from '../services/SupabaseBackend'
import * as store from '../store'

export default {
	name: 'MansionAdminDashboard',
	props: {
		routeParams: { type: Object, default: () => ( {} ) }
	},
	data() {
		return {
			// Menu
			menuItems: MANSION_ADMIN_MENU_ITEMS,
			// Loading states
			isLoading: false,
			isLoadingResidents: false,
			isInvitingResident: false,
			isEditingResident: false,
			isDeletingResident: false,
			// Data
			residents: [],
			// Filtering / sorting / pagination
			residentFilters: {
				search: ''
			},
			residentPagination: {
				page: 1,
				limit: 25,
				total: 0,
				totalPages: 0
			},
			residentSort: '-createdAt',
			searchTimeout: null,
			// Invite modal
			showInviteResidentModal: false,
			newResident: {
				email: '',
				name: '',
				unit: '',
				phone: ''
			},
			// Edit modal
			showEditResidentModal: false,
			editingResident: null,
			editResidentForm: {
				name: '',
				unit: '',
				phone: ''
			},
			// Delete modal
			showDeleteConfirm: false,
			deleteTarget: null
		}
	},
	computed: {
		user() {
			return store.user.value
		},
		mansionId() {
			return store.mansionId.value
		},
		buildingName() {
			return this.user?.mansionName || 'Building Dashboard'
		},
		activeSection() {
			return this.routeParams?.section || 'residents'
		},
		menuItemsWithLabels() {
			return this.menuItems.map( item => ( {
				...item,
				label: this.$t( `mansion.menu.${item.id}` )
			} ) )
		},
		residentsStats() {
			const now = new Date()
			const thirtyDaysAgo = new Date()
			thirtyDaysAgo.setDate( now.getDate() - 30 )

			return {
				total: this.residentPagination.total,
				active: this.residents.filter( r => r.status === 'active' ).length,
				recent: this.residents.filter( r => {
					if ( !r.createdAt ) return false
					return new Date( r.createdAt ) > thirtyDaysAgo
				} ).length
			}
		}
	},
	async mounted() {
		document.querySelector( '#app' )?.scrollTo( 0, 0 )

		// Security: Verify user has mansion admin/manager/admin role
		if ( !store.isAuthenticated.value ) {
			this.$router.push( '/login' )
			return
		}
		const allowedRoles = ['admin', 'manager', 'mansion_admin']
		if ( !allowedRoles.includes( store.userRole.value ) ) {
			this.$router.push( '/dashboard' )
			return
		}

		// Load initial data
		await this.loadInitialData()
	},
	methods: {
		navigateToSection( section ) {
			this.$router.push( `/mansion-dashboard/${section}` )
		},
		handleLogout() {
			store.logout()
			this.$router.push( '/login' )
		},

		// ==========================================
		// DATA LOADING
		// ==========================================

		async loadInitialData() {
			this.isLoading = true
			try {
				await this.fetchResidents()
			} catch ( error ) {
				console.error( 'Failed to load initial data:', error )
			} finally {
				this.isLoading = false
			}
		},

		async fetchResidents() {
			this.isLoadingResidents = true
			try {
				const response = await backend.getUsers( {
					mansionId: this.mansionId,
					role: 'resident',
					search: this.residentFilters.search || undefined,
					page: this.residentPagination.page,
					limit: this.residentPagination.limit,
					sort: this.residentSort
				} )
				if ( response.success ) {
					this.residents = response.data.map( r => ( {
						...r,
						status: 'active',
						moveInDate: r.createdAt
					} ) )
					this.residentPagination.total = response.meta.total
					this.residentPagination.totalPages = response.meta.totalPages
				}
			} catch ( error ) {
				console.error( 'Failed to fetch residents:', error )
			} finally {
				this.isLoadingResidents = false
			}
		},

		// ==========================================
		// SEARCH / SORT / PAGINATION
		// ==========================================

		handleResidentSearch( value ) {
			this.residentFilters.search = value
			if ( this.searchTimeout ) {
				clearTimeout( this.searchTimeout )
			}
			this.searchTimeout = setTimeout( () => {
				this.residentPagination.page = 1
				this.fetchResidents()
			}, 300 )
		},

		handleResidentSort( field ) {
			if ( this.residentSort === field ) {
				this.residentSort = `-${field}`
			} else if ( this.residentSort === `-${field}` ) {
				this.residentSort = field
			} else {
				this.residentSort = `-${field}`
			}
			this.fetchResidents()
		},

		handleResidentPageChange( page ) {
			this.residentPagination.page = page
			this.fetchResidents()
		},

		// ==========================================
		// INVITE RESIDENT
		// ==========================================

		openInviteResidentModal() {
			this.newResident = { email: '', name: '', unit: '', phone: '' }
			this.showInviteResidentModal = true
		},

		async inviteResident() {
			this.isInvitingResident = true
			try {
				const response = await backend.inviteUser( {
					email: this.newResident.email,
					name: this.newResident.name,
					role: 'resident',
					mansionId: this.mansionId,
					unit: this.newResident.unit
				} )
				if ( response.success ) {
					this.showInviteResidentModal = false
					alert( this.$t( 'mansion.residents.inviteSent' ) || 'Invitation sent successfully!' )
					await this.fetchResidents()
				}
			} catch ( error ) {
				console.error( 'Failed to invite resident:', error )
				alert( error.error?.message || 'Failed to send invitation' )
			} finally {
				this.isInvitingResident = false
			}
		},

		// ==========================================
		// EDIT RESIDENT
		// ==========================================

		openEditResidentModal( resident ) {
			this.editingResident = resident
			this.editResidentForm = {
				name: resident.name || '',
				unit: resident.unit || '',
				phone: resident.phone || ''
			}
			this.showEditResidentModal = true
		},

		async saveEditResident() {
			if ( !this.editingResident ) return
			this.isEditingResident = true
			try {
				const response = await backend.updateUser( this.editingResident.id, {
					name: this.editResidentForm.name,
					unit: this.editResidentForm.unit,
					phone: this.editResidentForm.phone
				} )
				if ( response.success ) {
					this.showEditResidentModal = false
					this.editingResident = null
					await this.fetchResidents()
				}
			} catch ( error ) {
				console.error( 'Failed to update resident:', error )
				alert( error.error?.message || 'Failed to update resident' )
			} finally {
				this.isEditingResident = false
			}
		},

		// ==========================================
		// DELETE RESIDENT
		// ==========================================

		confirmDeleteResident( resident ) {
			this.deleteTarget = resident
			this.showDeleteConfirm = true
		},

		async deleteResident() {
			if ( !this.deleteTarget ) return
			this.isDeletingResident = true
			try {
				const response = await backend.deleteUser( this.deleteTarget.id )
				if ( response.success ) {
					this.showDeleteConfirm = false
					this.deleteTarget = null
					await this.fetchResidents()
				}
			} catch ( error ) {
				console.error( 'Failed to delete resident:', error )
				alert( error.error?.message || 'Failed to delete resident' )
			} finally {
				this.isDeletingResident = false
			}
		},

		cancelDelete() {
			this.showDeleteConfirm = false
			this.deleteTarget = null
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../styles/tokens.styl'

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
		box-sizing border-box

		&:focus
			outline none
			border-color $color-primary
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

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
</style>
