<template>
	<div>
		<MansionResidentsSection
			:residents="residents"
			:loading="isLoadingResidents"
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
			:title="$t('mansion.residents.invite')"
			size="medium"
		>
			<form @submit.prevent="inviteResident">
				<div class="form-group">
					<label for="resident-email">{{ $t('common.email') }} *</label>
					<input
						id="resident-email"
						v-model="newResident.email"
						type="email"
						required
						placeholder="resident@example.com"
					>
				</div>
				<div class="form-group">
					<label for="resident-name">{{ $t('common.name') }}</label>
					<input
						id="resident-name"
						v-model="newResident.name"
						type="text"
						placeholder="John Doe"
					>
				</div>
				<div class="form-group">
					<label for="resident-unit">{{ $t('mansion.residents.unit') }} *</label>
					<input
						id="resident-unit"
						v-model="newResident.unit"
						type="text"
						required
						placeholder="e.g. 1201"
					>
				</div>
				<div class="form-group">
					<label for="resident-phone">{{ $t('common.phone') }}</label>
					<input
						id="resident-phone"
						v-model="newResident.phone"
						type="tel"
						placeholder="+81-90-1234-5678"
					>
				</div>
				<p class="help-text">
					{{ $t('mansion.residents.inviteHelp') }}
				</p>
			</form>

			<template #footer>
				<KButton variant="secondary" @click="showInviteResidentModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="primary" :loading="isInvitingResident" @click="inviteResident">
					{{ $t('common.sendInvite') }}
				</KButton>
			</template>
		</KModal>

		<!-- Edit Resident Modal -->
		<KModal
			v-model="showEditResidentModal"
			:title="$t('mansion.residents.editResident')"
		>
			<form class="modal-form" @submit.prevent="saveEditResident">
				<div class="form-group">
					<label>{{ $t('common.email') }}</label>
					<input
						type="email"
						:value="editingResident?.email"
						disabled
						class="input-disabled"
					>
				</div>
				<div class="form-group">
					<label for="edit-name">{{ $t('common.name') }}</label>
					<input
						id="edit-name"
						v-model="editResidentForm.name"
						type="text"
						:placeholder="$t('common.name')"
					>
				</div>
				<div class="form-group">
					<label for="edit-unit">{{ $t('mansion.residents.unit') }}</label>
					<input
						id="edit-unit"
						v-model="editResidentForm.unit"
						type="text"
						placeholder="e.g. 1201"
					>
				</div>
				<div class="form-group">
					<label for="edit-phone">{{ $t('common.phone') }}</label>
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
					{{ $t('common.save') }}
				</KButton>
			</template>
		</KModal>

		<!-- Delete Confirmation Modal -->
		<KModal
			v-model="showDeleteConfirm"
			:title="$t('common.confirmDelete')"
			size="small"
		>
			<p>
				{{ $t('mansion.residents.deleteConfirm') }}
				<strong>{{ deleteTarget?.email }}</strong>
			</p>

			<template #footer>
				<KButton variant="secondary" @click="cancelDelete">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="danger" :loading="isDeletingResident" @click="deleteResident">
					{{ $t('common.delete') }}
				</KButton>
			</template>
		</KModal>
	</div>
</template>
<script>
import backend from '../../../services/SupabaseBackend'

export default {
	name: 'MansionResidentsManager',
	props: {
		mansionId: {
			type: String,
			required: true
		}
	},
	emits: ['residents-loaded'],
	data() {
		return {
			// Loading states
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
	async mounted() {
		await this.fetchResidents()
	},
	methods: {
		// ==========================================
		// DATA LOADING
		// ==========================================

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
					this.$emit( 'residents-loaded', this.residentPagination.total )
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
					alert( this.$t( 'mansion.residents.inviteSent' ) )
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
@import '../../../styles/_form-modal.styl'
</style>
