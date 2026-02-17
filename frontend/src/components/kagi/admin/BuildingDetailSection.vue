<template>
	<section class="building-detail-section">
		<!-- Back Navigation -->
		<div class="back-nav">
			<KButton variant="ghost" @click="$emit('back')">
				← {{ $t('common.back') }}
			</KButton>
		</div>

		<!-- Building Info Header -->
		<SectionHeader
			:title="building.name"
			icon="🏢"
		>
			<template #actions>
				<KButton v-if="!isEditing" variant="secondary" @click="toggleEditMode">
					{{ $t('common.edit') }}
				</KButton>
				<template v-else>
					<KButton variant="secondary" @click="cancelEdit">
						{{ $t('common.cancel') }}
					</KButton>
					<KButton variant="primary" :loading="isSaving" @click="saveBuilding">
						{{ $t('common.save') }}
					</KButton>
				</template>
			</template>
		</SectionHeader>

		<!-- Building Information Card -->
		<KCard :title="$t('admin.buildings.info')" outlined class="building-info-card">
			<!-- Display Mode -->
			<div v-if="!isEditing" class="building-info-grid">
				<div class="info-item">
					<span class="label">{{ $t('admin.buildings.name') }}:</span>
					<span class="value">{{ building.name }}</span>
				</div>
				<div class="info-item">
					<span class="label">{{ $t('admin.buildings.address') }}:</span>
					<span class="value">{{ building.address || '-' }}</span>
				</div>
				<div class="info-item">
					<span class="label">{{ $t('admin.buildings.units') }}:</span>
					<span class="value">{{ building.units || building.totalUnits || 0 }}</span>
				</div>
				<div class="info-item">
					<span class="label">{{ $t('admin.buildings.floors') }}:</span>
					<span class="value">{{ building.settings?.floors || '-' }}</span>
				</div>
				<div class="info-item full-width">
					<span class="label">{{ $t('admin.buildings.description') }}:</span>
					<span class="value">{{ building.settings?.description || building.description || '-' }}</span>
				</div>
				<div class="info-item full-width">
					<span class="label">{{ $t('admin.buildings.facilities') }}:</span>
					<span class="value">{{ formatFacilities(building.metadata?.facilities) }}</span>
				</div>
			</div>

			<!-- Edit Mode -->
			<form v-else class="building-edit-form" @submit.prevent="saveBuilding">
				<div class="form-group">
					<label for="edit-building-name">{{ $t('admin.buildings.name') }} *</label>
					<input
						id="edit-building-name"
						v-model="editForm.name"
						type="text"
						required
					>
				</div>
				<div class="form-group">
					<label for="edit-building-address">{{ $t('admin.buildings.address') }} *</label>
					<input
						id="edit-building-address"
						v-model="editForm.address"
						type="text"
						required
					>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="edit-building-units">{{ $t('admin.buildings.totalUnits') }}</label>
						<input
							id="edit-building-units"
							v-model.number="editForm.units"
							type="number"
							min="1"
						>
					</div>
					<div class="form-group">
						<label for="edit-building-floors">{{ $t('admin.buildings.floors') }}</label>
						<input
							id="edit-building-floors"
							v-model.number="editForm.floors"
							type="number"
							min="1"
						>
					</div>
				</div>
				<div class="form-group full-width">
					<label for="edit-building-description">{{ $t('admin.buildings.description') }}</label>
					<textarea
						id="edit-building-description"
						v-model="editForm.description"
						rows="3"
					/>
				</div>
				<div class="form-group full-width">
					<label>{{ $t('admin.buildings.facilities') }}</label>
					<div class="facilities-checkboxes">
						<label v-for="facility in facilityOptions" :key="facility" class="checkbox-label">
							<input v-model="editForm.facilities" type="checkbox" :value="facility">
							<span>{{ $t(`facilities.${facility}`) }}</span>
						</label>
					</div>
				</div>
				<div class="form-group full-width">
					<label for="edit-building-rules">{{ $t('admin.buildings.rules') }}</label>
					<textarea
						id="edit-building-rules"
						v-model="editForm.rules"
						rows="4"
					/>
				</div>
			</form>
		</KCard>

		<!-- Users Section -->
		<SectionHeader
			:title="$t('admin.buildings.users')"
			icon="👥"
		>
			<template #actions>
				<KButton variant="primary" icon="➕" @click="showInviteModal = true">
					{{ $t('admin.users.invite') }}
				</KButton>
			</template>
		</SectionHeader>

		<!-- Loading State -->
		<div v-if="loading" class="loading-state">
			<p>{{ $t('common.loading') }}</p>
		</div>

		<!-- Empty State -->
		<div v-else-if="users.length === 0" class="empty-state">
			<p>{{ $t('admin.buildings.noUsers') }}</p>
			<KButton variant="primary" @click="showInviteModal = true">
				{{ $t('admin.users.invite') }}
			</KButton>
		</div>

		<!-- Users Table -->
		<KCard v-else elevated no-padding>
			<div class="users-table">
				<table>
					<thead>
						<tr>
							<th>{{ $t('admin.users.name') }}</th>
							<th>{{ $t('admin.users.email') }}</th>
							<th>{{ $t('admin.users.role') }}</th>
							<th>{{ $t('admin.users.unit') }}</th>
							<th>{{ $t('admin.users.actions') }}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="u in users" :key="u.id">
							<td>{{ u.name || '-' }}</td>
							<td>{{ u.email }}</td>
							<td>
								<div class="roles-checkboxes">
									<label v-for="role in buildingRoleOptions" :key="role.value" class="role-checkbox-label">
										<input
											type="checkbox"
											:checked="(u.roles || [u.role]).includes(role.value)"
											@change="toggleUserRole(u, role.value, $event.target.checked)"
										>
										{{ role.label }}
									</label>
								</div>
							</td>
							<td>{{ u.unit || '-' }}</td>
							<td class="actions-cell">
								<button class="action-btn" @click="$emit('edit-user', u)">
									✏️ {{ $t('common.edit') }}
								</button>
								<button class="action-btn action-btn--danger" @click="$emit('delete-user', u)">
									🗑️ {{ $t('common.delete') }}
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</KCard>

		<!-- Invite User Modal -->
		<KModal v-model="showInviteModal" :title="existingUser ? $t('admin.users.addExisting') : $t('admin.users.inviteNew')">
			<form @submit.prevent="existingUser ? submitAddExisting() : submitInvite()">
				<div class="form-group">
					<label for="invite-email">{{ $t('admin.users.email') }} *</label>
					<div class="email-input-wrapper">
						<input
							id="invite-email"
							v-model="inviteForm.email"
							type="email"
							required
							placeholder="user@example.com"
							@input="handleEmailInput"
						>
						<span v-if="isCheckingEmail" class="email-status checking">...</span>
					</div>
				</div>

				<!-- Existing User Found -->
				<div v-if="existingUser" class="existing-user-card">
					<div class="existing-user-header">
						<span class="existing-user-icon">👤</span>
						<div class="existing-user-info">
							<strong>{{ existingUser.name || existingUser.email }}</strong>
							<span class="existing-user-role">{{ getRoleLabel(existingUser.role) }}</span>
						</div>
					</div>
					<div class="existing-user-details">
						<p v-if="existingUser.mansionName">
							{{ $t('admin.users.currentBuilding') }}: <strong>{{ existingUser.mansionName }}</strong>
						</p>
						<p v-else>
							{{ $t('admin.users.noCurrentBuilding') }}
						</p>
					</div>
					<p class="help-text">
						{{ $t('admin.users.addExistingHelp') }}
					</p>
				</div>

				<!-- New User Form -->
				<template v-else>
					<div class="form-group">
						<label for="invite-name">{{ $t('admin.users.name') }}</label>
						<input
							id="invite-name"
							v-model="inviteForm.name"
							type="text"
							placeholder="John Doe"
						>
					</div>
					<div class="form-group">
						<label>{{ $t('admin.users.role') }} *</label>
						<div class="roles-checkboxes">
							<label v-for="role in buildingRoleOptions" :key="role.value" class="role-checkbox-label">
								<input
									type="checkbox"
									:checked="inviteForm.roles.includes(role.value)"
									@change="toggleInviteRole(role.value, $event.target.checked)"
								>
								{{ role.label }}
							</label>
						</div>
					</div>
					<div v-if="showUnitField" class="form-group">
						<label for="invite-unit">{{ $t('admin.users.unit') }}</label>
						<input
							id="invite-unit"
							v-model="inviteForm.unit"
							type="text"
							:placeholder="$t('admin.users.unitPlaceholder')"
						>
					</div>
					<p class="help-text">
						{{ $t('admin.users.inviteHelp') }}
					</p>
				</template>
			</form>

			<template #footer>
				<KButton variant="secondary" @click="closeInviteModal">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton
					v-if="existingUser"
					variant="primary"
					:loading="isAddingUser"
					@click="submitAddExisting"
				>
					{{ $t('admin.users.addToBuilding') }}
				</KButton>
				<KButton
					v-else
					variant="primary"
					:loading="isInviting"
					:disabled="isCheckingEmail"
					@click="submitInvite"
				>
					{{ $t('admin.users.sendInvite') }}
				</KButton>
			</template>
		</KModal>
	</section>
</template>

<script>
export default {
	name: 'BuildingDetailSection',
	props: {
		building: {
			type: Object,
			required: true
		},
		users: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: false
		},
		roleOptions: {
			type: Array,
			default: () => []
		},
		isSaving: {
			type: Boolean,
			default: false
		},
		isInviting: {
			type: Boolean,
			default: false
		},
		isAddingUser: {
			type: Boolean,
			default: false
		}
	},
	emits: ['back', 'update-building', 'invite-user', 'update-user', 'edit-user', 'delete-user', 'add-existing-user'],
	data() {
		return {
			isEditing: false,
			showInviteModal: false,
			editForm: {
				name: '',
				address: '',
				description: '',
				units: null,
				floors: null,
				facilities: [],
				rules: ''
			},
			inviteForm: {
				email: '',
				name: '',
				roles: ['resident'],
				unit: ''
			},
			facilityOptions: ['gym', 'pool', 'parking', 'lounge', 'rooftop', 'laundry'],
			// Existing user check
			existingUser: null,
			isCheckingEmail: false,
			emailCheckTimeout: null
		}
	},
	computed: {
		showUnitField() {
			return this.inviteForm.roles.some( r => r === 'resident' || r === 'landlord' )
		},
		buildingRoleOptions() {
			return this.roleOptions.filter( r => r.value === 'resident' || r.value === 'mansion_admin' )
		}
	},
	watch: {
		building: {
			immediate: true,
			handler( newBuilding ) {
				if ( newBuilding ) {
					this.populateEditForm( newBuilding )
				}
			}
		},
		isSaving( saving ) {
			// Close edit mode when save completes
			if ( !saving && this.isEditing ) {
				this.isEditing = false
			}
		},
		isInviting( inviting ) {
			// Close modal when invite completes
			if ( !inviting && this.showInviteModal ) {
				this.closeInviteModal()
			}
		},
		isAddingUser( adding ) {
			// Close modal when add existing user completes
			if ( !adding && this.showInviteModal ) {
				this.closeInviteModal()
			}
		}
	},
	methods: {
		populateEditForm( building ) {
			this.editForm = {
				name: building.name || '',
				address: building.address || '',
				description: building.settings?.description || building.description || '',
				units: building.totalUnits || building.units || null,
				floors: building.settings?.floors || null,
				facilities: building.metadata?.facilities || [],
				rules: building.settings?.rules || ''
			}
		},
		toggleEditMode() {
			this.isEditing = true
		},
		cancelEdit() {
			this.populateEditForm( this.building )
			this.isEditing = false
		},
		saveBuilding() {
			this.$emit( 'update-building', {
				id: this.building.id,
				...this.editForm
			} )
		},
		toggleUserRole( user, role, checked ) {
			const currentRoles = user.roles || [user.role]
			let newRoles
			if ( checked ) {
				newRoles = [...currentRoles, role]
			} else {
				newRoles = currentRoles.filter( r => r !== role )
			}
			if ( newRoles.length === 0 ) return
			this.$emit( 'update-user', { userId: user.id, roles: newRoles } )
		},
		toggleInviteRole( role, checked ) {
			if ( checked ) {
				if ( !this.inviteForm.roles.includes( role ) ) {
					this.inviteForm.roles.push( role )
				}
			} else {
				this.inviteForm.roles = this.inviteForm.roles.filter( r => r !== role )
			}
		},
		submitInvite() {
			this.$emit( 'invite-user', {
				...this.inviteForm,
				mansionId: this.building.id
			} )
		},
		submitAddExisting() {
			this.$emit( 'add-existing-user', {
				userId: this.existingUser.id,
				mansionId: this.building.id
			} )
		},
		handleEmailInput() {
			// Clear previous timeout
			if ( this.emailCheckTimeout ) {
				clearTimeout( this.emailCheckTimeout )
			}
			// Reset existing user
			this.existingUser = null

			// Validate email format before checking
			const email = this.inviteForm.email.trim()
			if ( !email || !email.includes( '@' ) ) {
				return
			}

			// Debounce the check
			this.emailCheckTimeout = setTimeout( () => {
				this.checkExistingUser( email )
			}, 500 )
		},
		async checkExistingUser( email ) {
			this.isCheckingEmail = true
			try {
				const backend = ( await import( '../../../services/SupabaseBackend' ) ).default
				const response = await backend.getUserByEmail( email )
				if ( response.success && response.data ) {
					this.existingUser = response.data
				}
			} catch ( error ) {
				console.error( 'Failed to check existing user:', error )
			} finally {
				this.isCheckingEmail = false
			}
		},
		closeInviteModal() {
			this.showInviteModal = false
			this.resetInviteForm()
			this.existingUser = null
			this.isCheckingEmail = false
			if ( this.emailCheckTimeout ) {
				clearTimeout( this.emailCheckTimeout )
			}
		},
		resetInviteForm() {
			this.inviteForm = {
				email: '',
				name: '',
				roles: ['resident'],
				unit: ''
			}
		},
		getRoleLabel( role ) {
			const found = this.roleOptions.find( r => r.value === role )
			return found ? found.label : role
		},
		formatFacilities( facilities ) {
			if ( !facilities || facilities.length === 0 ) return '-'
			return facilities.map( f => this.$t( `facilities.${f}` ) ).join( ', ' )
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../../styles/tokens.styl'

.building-detail-section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

.back-nav
	margin-bottom 1.5rem

.building-info-card
	margin-bottom 2rem

.building-info-grid
	display grid
	grid-template-columns repeat(2, 1fr)
	gap 1rem

	@media (max-width: 768px)
		grid-template-columns 1fr

.info-item
	display flex
	flex-direction column
	gap 0.25rem

	&.full-width
		grid-column 1 / -1

	.label
		font-size 0.85rem
		color #666
		font-weight 500

	.value
		font-size 1rem
		color #333

// Form styles
.building-edit-form
	display grid
	grid-template-columns repeat(2, 1fr)
	gap 1rem

	@media (max-width: 768px)
		grid-template-columns 1fr

.form-group
	margin-bottom 0

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

		&:focus
			outline none
			border-color $color-primary
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

.form-row
	display grid
	grid-template-columns 1fr 1fr
	gap 1rem
	grid-column 1 / -1

	@media (max-width: 480px)
		grid-template-columns 1fr

.full-width
	grid-column 1 / -1

.facilities-checkboxes
	display grid
	grid-template-columns repeat(auto-fill, minmax(150px, 1fr))
	gap 0.75rem

.checkbox-label
	display flex
	align-items center
	cursor pointer
	padding 0.5rem
	border 1px solid #e0e0e0
	border-radius 8px

	&:hover
		background #f5f5f5

	input[type="checkbox"]
		margin-right 0.5rem

	span
		font-size 0.9rem

// Users table
.users-table
	overflow-x auto

	table
		width 100%
		border-collapse collapse

		th
			background #f5f5f5
			padding 1rem
			text-align left
			font-weight 600
			border-bottom 2px solid $color-primary

		td
			padding 1rem
			border-bottom 1px solid #f0f0f0

		tbody tr:hover
			background #f9f9f9

.roles-checkboxes
	display flex
	flex-wrap wrap
	gap 0.25rem 0.75rem

.role-checkbox-label
	display flex
	align-items center
	gap 0.35rem
	font-size 0.85rem
	cursor pointer
	white-space nowrap

	input[type="checkbox"]
		cursor pointer

.actions-cell
	display flex
	gap 0.5rem

.action-btn
	padding 0.35rem 0.6rem
	font-size 0.8rem
	border none
	border-radius 6px
	background transparent
	cursor pointer

	&:hover
		background #f0f0f0

	&--danger:hover
		background #ffebee
		color #d32f2f

.loading-state, .empty-state
	text-align center
	padding 3rem
	color #666

	p
		margin-bottom 1rem

.help-text
	color #666
	font-size 0.9rem
	margin-top 1rem
	padding 0.75rem
	background #f5f5f5
	border-radius 8px

// Email input with status
.email-input-wrapper
	position relative

	input
		padding-right 2.5rem

	.email-status
		position absolute
		right 0.75rem
		top 50%
		transform translateY(-50%)
		font-size 0.9rem

		&.checking
			color #999

// Existing user card
.existing-user-card
	background #e3f2fd
	border 1px solid #90caf9
	border-radius 8px
	padding 1rem
	margin-bottom 1rem

.existing-user-header
	display flex
	align-items center
	gap 0.75rem
	margin-bottom 0.75rem

.existing-user-icon
	font-size 1.5rem
	background white
	width 40px
	height 40px
	border-radius 50%
	display flex
	align-items center
	justify-content center

.existing-user-info
	display flex
	flex-direction column
	gap 0.25rem

	strong
		color #1565c0

.existing-user-role
	font-size 0.85rem
	color #666

.existing-user-details
	p
		margin 0.25rem 0
		font-size 0.9rem
		color #555
</style>
