<template>
	<div>
		<MansionBookingsSection
			:bookings="bookings"
			:facilities="facilities"
			:loading="isLoadingBookings"
			:stats="bookingsStats"
			:pagination="bookingPagination"
			:sort="bookingSort"
			:search="bookingFilters.search"
			:status-filter="bookingFilters.status"
			@search="handleBookingSearch"
			@sort="handleBookingSort"
			@page-change="handleBookingPageChange"
			@filter-status="handleBookingStatusFilter"
			@approve="approveBooking"
			@reject="rejectBooking"
			@edit-booking="openEditBookingModal"
			@delete-booking="confirmDeleteBooking"
			@block-slot="openBlockSlotModal"
			@edit-facility="openEditFacilityModal"
			@toggle-facility-status="toggleFacilityStatus"
		/>

		<!-- Edit Facility Modal -->
		<KModal
			v-model="showEditFacilityModal"
			:title="$t('mansion.facilities.editFacility')"
			size="medium"
		>
			<form @submit.prevent="saveFacility">
				<div class="form-group">
					<label for="facility-title">{{ $t('mansion.facilities.title') }}</label>
					<input
						id="facility-title"
						v-model="editFacilityForm.title"
						type="text"
					>
				</div>
				<div class="form-group">
					<label for="facility-description">{{ $t('mansion.facilities.description') }}</label>
					<textarea
						id="facility-description"
						v-model="editFacilityForm.description"
						rows="3"
					/>
				</div>
				<div class="form-group">
					<label for="facility-status">{{ $t('mansion.facilities.status') }}</label>
					<select id="facility-status" v-model="editFacilityForm.status">
						<option value="active">{{ $t('mansion.facilities.statusActive') }}</option>
						<option value="inactive">{{ $t('mansion.facilities.statusInactive') }}</option>
						<option value="maintenance">{{ $t('mansion.facilities.statusMaintenance') }}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="facility-category">{{ $t('mansion.facilities.category') }}</label>
					<input
						id="facility-category"
						v-model="editFacilityForm.category"
						type="text"
					>
				</div>
				<div class="form-group">
					<label for="facility-capacity">{{ $t('mansion.facilities.capacity') }}</label>
					<input
						id="facility-capacity"
						v-model.number="editFacilityForm.capacity"
						type="number"
						min="0"
					>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="facility-open">{{ $t('mansion.facilities.openTime') }}</label>
						<input
							id="facility-open"
							v-model="editFacilityForm.hoursOpen"
							type="time"
						>
					</div>
					<div class="form-group">
						<label for="facility-close">{{ $t('mansion.facilities.closeTime') }}</label>
						<input
							id="facility-close"
							v-model="editFacilityForm.hoursClose"
							type="time"
						>
					</div>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="facility-hourly">{{ $t('mansion.facilities.hourlyRate') }} (¥)</label>
						<input
							id="facility-hourly"
							v-model.number="editFacilityForm.pricingHourly"
							type="number"
							min="0"
						>
					</div>
					<div class="form-group">
						<label for="facility-deposit">{{ $t('mansion.facilities.deposit') }} (¥)</label>
						<input
							id="facility-deposit"
							v-model.number="editFacilityForm.pricingDeposit"
							type="number"
							min="0"
						>
					</div>
				</div>
				<div class="form-group">
					<label for="facility-booking-type">{{ $t('mansion.facilities.bookingType') }}</label>
					<select id="facility-booking-type" v-model="editFacilityForm.bookingType">
						<option value="hourly">{{ $t('mansion.facilities.hourly') }}</option>
						<option value="half-day">{{ $t('mansion.facilities.halfDay') }}</option>
						<option value="full-day">{{ $t('mansion.facilities.fullDay') }}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="facility-rules">{{ $t('mansion.facilities.rules') }}</label>
					<textarea
						id="facility-rules"
						v-model="editFacilityForm.rules"
						rows="3"
					/>
				</div>
			</form>

			<template #footer>
				<KButton variant="secondary" @click="showEditFacilityModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="primary" :loading="isSavingFacility" @click="saveFacility">
					{{ $t('common.save') }}
				</KButton>
			</template>
		</KModal>

		<!-- Edit Booking / Block Time Slot Modal -->
		<KModal
			v-model="showEditBookingModal"
			:title="isBlockMode ? $t('mansion.bookings.blockSlot') : $t('mansion.bookings.editBooking')"
			size="medium"
		>
			<form @submit.prevent="saveBooking">
				<div class="form-group">
					<label for="booking-facility">{{ $t('mansion.bookings.selectFacility') }}</label>
					<select id="booking-facility" v-model="editBookingForm.facilityId" required>
						<option value="">{{ $t('mansion.bookings.selectFacility') }}</option>
						<option
							v-for="f in facilities"
							:key="f.id"
							:value="f.id"
						>
							{{ f.title || f.name }}
						</option>
					</select>
				</div>
				<div class="form-group">
					<label for="booking-title">{{ $t('mansion.bookings.reason') }}</label>
					<input
						id="booking-title"
						v-model="editBookingForm.title"
						type="text"
						required
					>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="booking-start-date">{{ $t('mansion.bookings.startDate') }}</label>
						<input
							id="booking-start-date"
							v-model="editBookingForm.startDate"
							type="date"
							required
						>
					</div>
					<div class="form-group">
						<label for="booking-start-time">{{ $t('mansion.bookings.startTime') }}</label>
						<input
							id="booking-start-time"
							v-model="editBookingForm.startTime"
							type="time"
							required
						>
					</div>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="booking-end-date">{{ $t('mansion.bookings.endDate') }}</label>
						<input
							id="booking-end-date"
							v-model="editBookingForm.endDate"
							type="date"
							required
						>
					</div>
					<div class="form-group">
						<label for="booking-end-time">{{ $t('mansion.bookings.endTime') }}</label>
						<input
							id="booking-end-time"
							v-model="editBookingForm.endTime"
							type="time"
							required
						>
					</div>
				</div>
				<div class="form-group">
					<label for="booking-description">{{ $t('mansion.facilities.description') }}</label>
					<textarea
						id="booking-description"
						v-model="editBookingForm.description"
						rows="2"
					/>
				</div>
				<div v-if="!isBlockMode && editingBooking" class="form-group">
					<label for="booking-status">{{ $t('mansion.bookings.status') }}</label>
					<select id="booking-status" v-model="editBookingForm.status">
						<option value="pending">{{ $t('status.pending') }}</option>
						<option value="confirmed">{{ $t('status.confirmed') }}</option>
						<option value="cancelled">{{ $t('status.cancelled') }}</option>
						<option value="completed">{{ $t('status.completed') }}</option>
					</select>
				</div>
				<p v-if="isBlockMode" class="help-text">
					{{ $t('mansion.bookings.blockHelp') }}
				</p>
			</form>

			<template #footer>
				<KButton variant="secondary" @click="showEditBookingModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="primary" :loading="isSavingBooking" @click="saveBooking">
					{{ $t('common.save') }}
				</KButton>
			</template>
		</KModal>

		<!-- Delete Booking Confirmation Modal -->
		<KModal
			v-model="showDeleteBookingConfirm"
			:title="$t('common.confirmDelete')"
			size="small"
		>
			<p>
				{{ $t('mansion.bookings.deleteConfirm') }}
				<strong>{{ deleteBookingTarget?.title }}</strong>
			</p>

			<template #footer>
				<KButton variant="secondary" @click="cancelDeleteBooking">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="danger" :loading="isDeletingBooking" @click="deleteBooking">
					{{ $t('common.delete') }}
				</KButton>
			</template>
		</KModal>
	</div>
</template>
<script>
import backend from '../../../services/SupabaseBackend'

export default {
	name: 'MansionBookingsManager',
	props: {
		mansionId: {
			type: String,
			required: true
		}
	},
	data() {
		return {
			// Loading states
			isLoadingBookings: false,
			isLoadingFacilities: false,
			isSavingFacility: false,
			isSavingBooking: false,
			isDeletingBooking: false,

			// Data
			bookings: [],
			facilities: [],

			// Booking filters / sort / pagination
			bookingFilters: {
				search: '',
				status: null
			},
			bookingPagination: {
				page: 1,
				limit: 25,
				total: 0,
				totalPages: 0
			},
			bookingSort: '-startDate',
			searchTimeout: null,

			// Edit Facility modal
			showEditFacilityModal: false,
			editingFacility: null,
			editFacilityForm: {
				title: '',
				description: '',
				status: 'active',
				category: '',
				capacity: null,
				hoursOpen: '09:00',
				hoursClose: '21:00',
				pricingHourly: 0,
				pricingDeposit: 0,
				bookingType: 'hourly',
				rules: ''
			},

			// Edit Booking / Block Slot modal
			showEditBookingModal: false,
			editingBooking: null,
			isBlockMode: false,
			editBookingForm: {
				facilityId: '',
				title: '',
				description: '',
				startDate: '',
				startTime: '',
				endDate: '',
				endTime: '',
				status: 'confirmed'
			},

			// Delete booking confirmation
			showDeleteBookingConfirm: false,
			deleteBookingTarget: null
		}
	},
	computed: {
		bookingsStats() {
			const now = new Date()
			return {
				total: this.bookingPagination.total,
				upcoming: this.bookings.filter( b => {
					const start = new Date( b.startDate || b.dates?.start )
					return start > now
				} ).length,
				pending: this.bookings.filter( b => b.status === 'pending' ).length,
				confirmed: this.bookings.filter( b => b.status === 'confirmed' ).length
			}
		}
	},
	async mounted() {
		await Promise.all( [
			this.fetchBookings(),
			this.fetchFacilities()
		] )
	},
	methods: {
		// ==========================================
		// DATA LOADING
		// ==========================================

		async fetchBookings() {
			this.isLoadingBookings = true
			try {
				const filters = { mansionId: this.mansionId }
				if ( this.bookingFilters.status ) {
					filters.status = this.bookingFilters.status
				}
				const response = await backend.query( 'bookings', {
					filter: filters,
					search: this.bookingFilters.search || undefined,
					sort: this.bookingSort,
					page: this.bookingPagination.page,
					limit: this.bookingPagination.limit
				} )
				if ( response.success ) {
					this.bookings = response.data
					this.bookingPagination.total = response.meta.total
					this.bookingPagination.totalPages = response.meta.totalPages
				}
			} catch ( error ) {
				console.error( 'Failed to fetch bookings:', error )
			} finally {
				this.isLoadingBookings = false
			}
		},

		async fetchFacilities() {
			this.isLoadingFacilities = true
			try {
				const response = await backend.query( 'facilities', {
					filter: { mansionId: this.mansionId },
					limit: 100
				} )
				if ( response.success ) {
					this.facilities = response.data
				}
			} catch ( error ) {
				console.error( 'Failed to fetch facilities:', error )
			} finally {
				this.isLoadingFacilities = false
			}
		},

		// ==========================================
		// SEARCH / SORT / PAGINATION
		// ==========================================

		handleBookingSearch( value ) {
			this.bookingFilters.search = value
			if ( this.searchTimeout ) {
				clearTimeout( this.searchTimeout )
			}
			this.searchTimeout = setTimeout( () => {
				this.bookingPagination.page = 1
				this.fetchBookings()
			}, 300 )
		},

		handleBookingSort( field ) {
			if ( this.bookingSort === field ) {
				this.bookingSort = `-${field}`
			} else if ( this.bookingSort === `-${field}` ) {
				this.bookingSort = field
			} else {
				this.bookingSort = `-${field}`
			}
			this.fetchBookings()
		},

		handleBookingPageChange( page ) {
			this.bookingPagination.page = page
			this.fetchBookings()
		},

		handleBookingStatusFilter( status ) {
			this.bookingFilters.status = status
			this.bookingPagination.page = 1
			this.fetchBookings()
		},

		// ==========================================
		// BOOKING ACTIONS (APPROVE / REJECT)
		// ==========================================

		async approveBooking( bookingId ) {
			try {
				const response = await backend.update( 'bookings', bookingId, { status: 'confirmed' } )
				if ( response.success ) {
					await this.fetchBookings()
				}
			} catch ( error ) {
				console.error( 'Failed to approve booking:', error )
				alert( error.error?.message || 'Failed to approve booking' )
			}
		},

		async rejectBooking( bookingId ) {
			try {
				const response = await backend.update( 'bookings', bookingId, { status: 'cancelled' } )
				if ( response.success ) {
					await this.fetchBookings()
				}
			} catch ( error ) {
				console.error( 'Failed to reject booking:', error )
				alert( error.error?.message || 'Failed to reject booking' )
			}
		},

		// ==========================================
		// EDIT BOOKING / BLOCK SLOT
		// ==========================================

		openEditBookingModal( booking ) {
			this.editingBooking = booking
			this.isBlockMode = false
			const startDate = booking.startDate || booking.dates?.start
			const endDate = booking.endDate || booking.dates?.end
			this.editBookingForm = {
				facilityId: booking.facilityId || '',
				title: booking.title || '',
				description: booking.description || '',
				startDate: startDate ? new Date( startDate ).toISOString().split( 'T' )[0] : '',
				startTime: startDate ? new Date( startDate ).toTimeString().slice( 0, 5 ) : '',
				endDate: endDate ? new Date( endDate ).toISOString().split( 'T' )[0] : '',
				endTime: endDate ? new Date( endDate ).toTimeString().slice( 0, 5 ) : '',
				status: booking.status || 'confirmed'
			}
			this.showEditBookingModal = true
		},

		openBlockSlotModal( prefill ) {
			this.editingBooking = null
			this.isBlockMode = true
			const date = prefill?.date ? new Date( prefill.date ).toISOString().split( 'T' )[0] : ''
			this.editBookingForm = {
				facilityId: prefill?.facilityId || '',
				title: '',
				description: '',
				startDate: date,
				startTime: '09:00',
				endDate: date,
				endTime: '17:00',
				status: 'confirmed'
			}
			this.showEditBookingModal = true
		},

		async saveBooking() {
			this.isSavingBooking = true
			try {
				const startDateTime = new Date( `${this.editBookingForm.startDate}T${this.editBookingForm.startTime}` )
				const endDateTime = new Date( `${this.editBookingForm.endDate}T${this.editBookingForm.endTime}` )

				const payload = {
					facilityId: this.editBookingForm.facilityId,
					title: this.editBookingForm.title,
					description: this.editBookingForm.description,
					status: this.editBookingForm.status,
					mansionId: this.mansionId,
					dates: {
						start: startDateTime.toISOString(),
						end: endDateTime.toISOString()
					}
				}

				let response
				if ( this.editingBooking ) {
					response = await backend.update( 'bookings', this.editingBooking.id, payload )
				} else {
					response = await backend.create( 'bookings', payload )
				}

				if ( response.success ) {
					this.showEditBookingModal = false
					this.editingBooking = null
					await this.fetchBookings()
				}
			} catch ( error ) {
				console.error( 'Failed to save booking:', error )
				alert( error.error?.message || 'Failed to save booking' )
			} finally {
				this.isSavingBooking = false
			}
		},

		// ==========================================
		// DELETE BOOKING
		// ==========================================

		confirmDeleteBooking( booking ) {
			this.deleteBookingTarget = booking
			this.showDeleteBookingConfirm = true
		},

		async deleteBooking() {
			if ( !this.deleteBookingTarget ) return
			this.isDeletingBooking = true
			try {
				const response = await backend.delete( 'bookings', this.deleteBookingTarget.id )
				if ( response.success ) {
					this.showDeleteBookingConfirm = false
					this.deleteBookingTarget = null
					await this.fetchBookings()
				}
			} catch ( error ) {
				console.error( 'Failed to delete booking:', error )
				alert( error.error?.message || 'Failed to delete booking' )
			} finally {
				this.isDeletingBooking = false
			}
		},

		cancelDeleteBooking() {
			this.showDeleteBookingConfirm = false
			this.deleteBookingTarget = null
		},

		// ==========================================
		// EDIT FACILITY
		// ==========================================

		openEditFacilityModal( facility ) {
			this.editingFacility = facility
			this.editFacilityForm = {
				title: facility.title || facility.name || '',
				description: facility.description || '',
				status: facility.status || 'active',
				category: facility.category || '',
				capacity: facility.capacity || null,
				hoursOpen: facility.hours?.open || '09:00',
				hoursClose: facility.hours?.close || '21:00',
				pricingHourly: facility.pricing?.hourly || 0,
				pricingDeposit: facility.pricing?.deposit || 0,
				bookingType: facility.bookingType || 'hourly',
				rules: Array.isArray( facility.rules ) ? facility.rules.join( '\n' ) : ( facility.rules || '' )
			}
			this.showEditFacilityModal = true
		},

		async saveFacility() {
			if ( !this.editingFacility ) return
			this.isSavingFacility = true
			try {
				const payload = {
					title: this.editFacilityForm.title,
					description: this.editFacilityForm.description,
					status: this.editFacilityForm.status,
					category: this.editFacilityForm.category,
					capacity: this.editFacilityForm.capacity,
					hours: {
						open: this.editFacilityForm.hoursOpen,
						close: this.editFacilityForm.hoursClose
					},
					pricing: {
						hourly: this.editFacilityForm.pricingHourly,
						deposit: this.editFacilityForm.pricingDeposit
					},
					bookingType: this.editFacilityForm.bookingType,
					rules: this.editFacilityForm.rules
						? this.editFacilityForm.rules.split( '\n' ).filter( r => r.trim() )
						: []
				}

				const response = await backend.update( 'facilities', this.editingFacility.id, payload )
				if ( response.success ) {
					this.showEditFacilityModal = false
					this.editingFacility = null
					await this.fetchFacilities()
				}
			} catch ( error ) {
				console.error( 'Failed to save facility:', error )
				alert( error.error?.message || 'Failed to save facility' )
			} finally {
				this.isSavingFacility = false
			}
		},

		async toggleFacilityStatus( facility ) {
			const newStatus = facility.status === 'active' ? 'inactive' : 'active'
			try {
				const response = await backend.update( 'facilities', facility.id, { status: newStatus } )
				if ( response.success ) {
					await this.fetchFacilities()
				}
			} catch ( error ) {
				console.error( 'Failed to toggle facility status:', error )
				alert( error.error?.message || 'Failed to update facility status' )
			}
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/_form-modal.styl'

.form-row
	display flex
	gap 1rem

	.form-group
		flex 1
</style>
