<template>
	<DashboardLayout
		:title="buildingName"
		:user-email="user?.email || 'Mansion Admin'"
		user-role="Mansion Administrator"
		:menu-items="menuItemsWithLabels"
		:active-section="activeSection"
		@navigate="navigateToSection"
		@logout="handleLogout"
		@logo-click="navigateToSection('overview')"
	>
		<!-- Overview Section -->
		<MansionOverviewSection
			v-if="activeSection === 'overview'"
			:stats="dashboardStats"
			:recent-activities="recentActivities"
			:loading="isLoading"
		/>

		<!-- Residents Section -->
		<ResidentsSection
			v-else-if="activeSection === 'residents'"
			:residents="residents"
			:loading="isLoadingResidents"
			@add="openInviteResidentModal"
			@edit="editResident"
			@message="messageResident"
		/>

		<!-- Maintenance Section -->
		<MaintenanceRequestsSection
			v-else-if="activeSection === 'maintenance'"
			:requests="maintenanceRequests"
			:loading="isLoadingMaintenance"
			@view="viewMaintenanceRequest"
			@update="updateMaintenanceStatus"
		/>

		<!-- Bookings Section -->
		<MansionBookingsSection
			v-else-if="activeSection === 'bookings'"
			:bookings="bookings"
			:facilities="facilities"
			:loading="isLoadingBookings"
			@approve="approveBooking"
			@reject="rejectBooking"
		/>

		<!-- Placeholder sections -->
		<div v-else class="section placeholder-section">
			<h2>{{ $t(`mansion.${activeSection}.title`) || activeSection }}</h2>
			<p>{{ $t('dashboard.comingSoon') || 'Coming soon...' }}</p>
		</div>

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
	</DashboardLayout>
</template>
<script>
import backend from '../services/SupabaseBackend'
import * as store from '../store'

const MENU_ITEMS = [
	{ id: 'overview', icon: '📊' },
	{ id: 'residents', icon: '👥' },
	{ id: 'maintenance', icon: '🔧' },
	{ id: 'bookings', icon: '📅' },
	{ id: 'announcements', icon: '📢' },
	{ id: 'documents', icon: '📄' },
	{ id: 'financial', icon: '💰' },
	{ id: 'reports', icon: '📈' },
	{ id: 'services', icon: '🛎️' },
	{ id: 'settings', icon: '⚙️' }
]

export default {
	name: 'MansionAdminDashboard',
	props: {
		routeParams: { type: Object, default: () => ( {} ) }
	},
	data() {
		return {
			// Loading states
			isLoading: false,
			isLoadingResidents: false,
			isLoadingMaintenance: false,
			isLoadingBookings: false,
			isInvitingResident: false,
			// Data
			residents: [],
			maintenanceRequests: [],
			bookings: [],
			facilities: [],
			dashboardData: null,
			// Modals
			showInviteResidentModal: false,
			newResident: {
				email: '',
				name: '',
				unit: '',
				phone: ''
			}
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
			return this.routeParams?.section || 'overview'
		},
		menuItemsWithLabels() {
			return MENU_ITEMS.map( item => ( {
				...item,
				label: this.$t( `mansion.menu.${item.id}` )
			} ) )
		},
		dashboardStats() {
			return {
				residents: this.residents.length,
				maintenance: this.maintenanceRequests.filter( m => m.status === 'pending' ).length,
				bookings: this.bookings.filter( b => b.status === 'pending' ).length,
				facilities: this.facilities.length
			}
		},
		recentActivities() {
			const activities = []
			// Recent maintenance requests
			this.maintenanceRequests.slice( 0, 3 ).forEach( m => {
				activities.push( {
					id: `maint-${m.id}`,
					icon: '🔧',
					text: `${m.title} - Unit ${m.unit || 'N/A'}`,
					time: this.formatTimeAgo( m.createdAt || m.dates?.created )
				} )
			} )
			// Recent bookings
			this.bookings.slice( 0, 2 ).forEach( b => {
				activities.push( {
					id: `book-${b.id}`,
					icon: '📅',
					text: `Booking request for ${b.facilityName || 'facility'}`,
					time: this.formatTimeAgo( b.createdAt || b.dates?.created )
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
			this.loadSectionData( newSection )
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
				await Promise.all( [
					this.fetchResidents(),
					this.fetchMaintenanceRequests(),
					this.fetchBookings(),
					this.fetchFacilities()
				] )
			} catch ( error ) {
				console.error( 'Failed to load initial data:', error )
			} finally {
				this.isLoading = false
			}
		},

		async loadSectionData( section ) {
			switch ( section ) {
				case 'residents':
					await this.fetchResidents()
					break
				case 'maintenance':
					await this.fetchMaintenanceRequests()
					break
				case 'bookings':
					await this.fetchBookings()
					break
			}
		},

		async fetchResidents() {
			this.isLoadingResidents = true
			try {
				const response = await backend.getUsers( this.mansionId )
				if ( response.success ) {
					this.residents = response.data.filter( u => u.role === 'resident' ).map( r => ( {
						...r,
						status: 'active',
						moveInDate: r.createdAt
					} ) )
				}
			} catch ( error ) {
				console.error( 'Failed to fetch residents:', error )
			} finally {
				this.isLoadingResidents = false
			}
		},

		async fetchMaintenanceRequests() {
			this.isLoadingMaintenance = true
			try {
				const response = await backend.maintenance().get()
				if ( response.success ) {
					this.maintenanceRequests = response.data.map( m => ( {
						...m,
						created: m.dates?.created
					} ) )
				}
			} catch ( error ) {
				console.error( 'Failed to fetch maintenance requests:', error )
			} finally {
				this.isLoadingMaintenance = false
			}
		},

		async fetchBookings() {
			this.isLoadingBookings = true
			try {
				const response = await backend.bookings().get()
				if ( response.success ) {
					this.bookings = response.data
				}
			} catch ( error ) {
				console.error( 'Failed to fetch bookings:', error )
			} finally {
				this.isLoadingBookings = false
			}
		},

		async fetchFacilities() {
			try {
				const response = await backend.facilities().get()
				if ( response.success ) {
					this.facilities = response.data
				}
			} catch ( error ) {
				console.error( 'Failed to fetch facilities:', error )
			}
		},

		// ==========================================
		// RESIDENT MANAGEMENT
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
				}
			} catch ( error ) {
				console.error( 'Failed to invite resident:', error )
				alert( error.error?.message || 'Failed to send invitation' )
			} finally {
				this.isInvitingResident = false
			}
		},

		editResident( resident ) {
			// TODO: Implement edit resident modal
			console.log( 'Edit resident:', resident )
		},

		messageResident( resident ) {
			// TODO: Implement messaging
			console.log( 'Message resident:', resident )
		},

		// ==========================================
		// MAINTENANCE MANAGEMENT
		// ==========================================

		viewMaintenanceRequest( request ) {
			// TODO: Implement view/detail modal
			console.log( 'View request:', request )
		},

		async updateMaintenanceStatus( requestId, newStatus ) {
			try {
				const response = await backend.maintenance().update( requestId, { status: newStatus } )
				if ( response.success ) {
					await this.fetchMaintenanceRequests()
				}
			} catch ( error ) {
				console.error( 'Failed to update maintenance status:', error )
			}
		},

		// ==========================================
		// BOOKING MANAGEMENT
		// ==========================================

		async approveBooking( bookingId ) {
			try {
				const response = await backend.bookings().update( bookingId, { status: 'confirmed' } )
				if ( response.success ) {
					await this.fetchBookings()
				}
			} catch ( error ) {
				console.error( 'Failed to approve booking:', error )
			}
		},

		async rejectBooking( bookingId ) {
			try {
				const response = await backend.bookings().update( bookingId, { status: 'cancelled' } )
				if ( response.success ) {
					await this.fetchBookings()
				}
			} catch ( error ) {
				console.error( 'Failed to reject booking:', error )
			}
		},

		// ==========================================
		// HELPERS
		// ==========================================

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
.section
	padding 2rem
	background white
	border-radius 12px
	h2
		margin-bottom 1rem

.placeholder-section
	text-align center
	color #666
	min-height 300px
	display flex
	flex-direction column
	justify-content center
	align-items center

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
			border-color #FFC107
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

.help-text
	color #666
	font-size 0.9rem
	margin-top 1rem
	padding 0.75rem
	background #f5f5f5
	border-radius 8px
</style>
