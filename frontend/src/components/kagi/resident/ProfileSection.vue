<template>
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">
				<span class="section-icon">👤</span>
				{{ $t('dashboard.profile.myProfile') }}
			</h2>
		</div>
		<div class="profile-container">
			<!-- Personal Information -->
			<div class="profile-card">
				<div class="card-header">
					<h3>{{ $t('dashboard.profile.personalInfo') }}</h3>
					<span v-if="saveStatus.profile" class="save-status">
						<span v-if="saveStatus.profile === 'saving'" class="status-saving">{{ $t('dashboard.profile.saving') }}</span>
						<span v-if="saveStatus.profile === 'saved'" class="status-saved">{{ $t('dashboard.profile.savedStatus') }}</span>
						<span v-if="saveStatus.profile === 'error'" class="status-error">{{ $t('dashboard.profile.saveError') }}</span>
					</span>
				</div>
				<div class="form-content">
					<div class="form-group">
						<label>{{ $t('dashboard.profile.name') }}</label>
						<input v-model="profileForm.name" type="text" disabled>
					</div>
					<div class="form-group">
						<label>{{ $t('dashboard.profile.email') }}</label>
						<input v-model="profileForm.email" type="email">
					</div>
					<div class="form-group">
						<label>{{ $t('dashboard.profile.phone') }}</label>
						<input v-model="profileForm.phone" type="tel">
					</div>
					<div class="form-group">
						<label>{{ $t('dashboard.profile.apartment') }}</label>
						<input v-model="profileForm.unit" type="text" disabled>
					</div>
				</div>
			</div>
			<!-- Emergency Contact -->
			<div class="profile-card">
				<div class="card-header">
					<h3>{{ $t('dashboard.profile.emergencyContact') }}</h3>
					<span v-if="saveStatus.emergency" class="save-status">
						<span v-if="saveStatus.emergency === 'saving'" class="status-saving">{{ $t('dashboard.profile.saving') }}</span>
						<span v-if="saveStatus.emergency === 'saved'" class="status-saved">{{ $t('dashboard.profile.savedStatus') }}</span>
						<span v-if="saveStatus.emergency === 'error'" class="status-error">{{ $t('dashboard.profile.saveError') }}</span>
					</span>
				</div>
				<div class="form-content">
					<div class="form-group">
						<label>{{ $t('dashboard.profile.emergencyName') }}</label>
						<input v-model="emergencyForm.name" type="text">
					</div>
					<div class="form-group">
						<label>{{ $t('dashboard.profile.emergencyPhone') }}</label>
						<input v-model="emergencyForm.phone" type="tel">
					</div>
					<div class="form-group">
						<label>{{ $t('dashboard.profile.emergencyRelationship') }}</label>
						<input v-model="emergencyForm.relationship" type="text">
					</div>
				</div>
			</div>
			<!-- Notification Preferences -->
			<div class="profile-card">
				<div class="card-header">
					<h3>{{ $t('dashboard.profile.notificationPreferences') }}</h3>
					<span v-if="saveStatus.preferences" class="save-status">
						<span v-if="saveStatus.preferences === 'saving'" class="status-saving">{{ $t('dashboard.profile.saving') }}</span>
						<span v-if="saveStatus.preferences === 'saved'" class="status-saved">{{ $t('dashboard.profile.savedStatus') }}</span>
						<span v-if="saveStatus.preferences === 'error'" class="status-error">{{ $t('dashboard.profile.saveError') }}</span>
					</span>
				</div>
				<div class="form-content">
					<div class="checkbox-group">
						<label>
							<input v-model="preferences.emailNotifications" type="checkbox">
							{{ $t('dashboard.profile.emailNotifications') }}
						</label>
					</div>
					<div class="checkbox-group">
						<label>
							<input v-model="preferences.smsNotifications" type="checkbox">
							{{ $t('dashboard.profile.smsNotifications') }}
						</label>
					</div>
				</div>
			</div>
			<!-- Account Actions -->
			<div class="profile-card account-card">
				<h3>{{ $t('dashboard.profile.account') }}</h3>
				<p class="account-description">{{ $t('dashboard.profile.logoutDescription') }}</p>
				<button type="button" class="logout-btn" @click="handleLogout">
					{{ $t('nav.logout') }}
				</button>
			</div>
		</div>
	</section>
</template>
<script>
import * as store from '../../../store'
export default {
	name: 'ProfileSection',
	data() {
		return {
			profileForm: {
				name: store.user.value?.name || '',
				email: store.user.value?.email || '',
				phone: store.user.value?.phone || '',
				unit: store.user.value?.unit || ''
			},
			emergencyForm: {
				name: '',
				phone: '',
				relationship: ''
			},
			preferences: {
				emailNotifications: true,
				smsNotifications: false
			},
			saveStatus: {
				profile: null,
				emergency: null,
				preferences: null
			},
			saveTimeouts: {},
			statusClearTimeouts: {},
			isInitialized: false
		}
	},
	watch: {
		'profileForm.email': function() {
			if ( this.isInitialized ) this.debouncedSave( 'profile', this.saveProfile )
		},
		'profileForm.phone': function() {
			if ( this.isInitialized ) this.debouncedSave( 'profile', this.saveProfile )
		},
		emergencyForm: {
			handler() {
				if ( this.isInitialized ) this.debouncedSave( 'emergency', this.saveEmergencyContact )
			},
			deep: true
		},
		preferences: {
			handler() {
				if ( this.isInitialized ) this.savePreferences()
			},
			deep: true
		}
	},
	mounted() {
		this.$nextTick( () => {
			this.isInitialized = true
		} )
	},
	beforeUnmount() {
		Object.values( this.saveTimeouts ).forEach( clearTimeout )
		Object.values( this.statusClearTimeouts ).forEach( clearTimeout )
	},
	methods: {
		debouncedSave( section, saveFunction ) {
			if ( this.saveTimeouts[ section ] ) {
				clearTimeout( this.saveTimeouts[ section ] )
			}
			this.saveTimeouts[ section ] = setTimeout( () => {
				saveFunction.call( this )
			}, 800 )
		},
		showSaveStatus( section, status ) {
			this.saveStatus[ section ] = status
			if ( this.statusClearTimeouts[ section ] ) {
				clearTimeout( this.statusClearTimeouts[ section ] )
			}
			if ( status === 'saved' ) {
				this.statusClearTimeouts[ section ] = setTimeout( () => {
					this.saveStatus[ section ] = null
				}, 2000 )
			}
		},
		async saveProfile() {
			this.showSaveStatus( 'profile', 'saving' )
			try {
				console.log( 'Auto-saving profile:', this.profileForm )
				await new Promise( resolve => setTimeout( resolve, 300 ) )
				this.showSaveStatus( 'profile', 'saved' )
			} catch ( error ) {
				console.error( 'Failed to save profile:', error )
				this.showSaveStatus( 'profile', 'error' )
			}
		},
		async saveEmergencyContact() {
			this.showSaveStatus( 'emergency', 'saving' )
			try {
				console.log( 'Auto-saving emergency contact:', this.emergencyForm )
				await new Promise( resolve => setTimeout( resolve, 300 ) )
				this.showSaveStatus( 'emergency', 'saved' )
			} catch ( error ) {
				console.error( 'Failed to save emergency contact:', error )
				this.showSaveStatus( 'emergency', 'error' )
			}
		},
		async savePreferences() {
			this.showSaveStatus( 'preferences', 'saving' )
			try {
				console.log( 'Auto-saving preferences:', this.preferences )
				await new Promise( resolve => setTimeout( resolve, 300 ) )
				this.showSaveStatus( 'preferences', 'saved' )
			} catch ( error ) {
				console.error( 'Failed to save preferences:', error )
				this.showSaveStatus( 'preferences', 'error' )
			}
		},
		async handleLogout() {
			await store.logout()
			this.$router.push( '/login' )
		}
	}
}
</script>
<style lang="stylus" scoped>
.section
	animation fadeIn 0.3s ease
.section-header
	margin-bottom 2rem
.section-title
	font-size 1.75rem
	color #333
	display flex
	align-items center
	gap 0.75rem
	.section-icon
		font-size 1.5rem
.profile-container
	display grid
	grid-template-columns repeat(auto-fit, minmax(350px, 1fr))
	gap 1.5rem
	@media (max-width: 768px)
		grid-template-columns 1fr
.profile-card
	background white
	border 1px solid #e0e0e0
	border-radius 12px
	padding 1.5rem
	.card-header
		display flex
		justify-content space-between
		align-items center
		margin-bottom 1.5rem
		border-bottom 2px solid #FFC107
		padding-bottom 0.5rem
		h3
			font-size 1.25rem
			color #333
			margin 0
	h3
		font-size 1.25rem
		margin-bottom 1.5rem
		color #333
		border-bottom 2px solid #FFC107
		padding-bottom 0.5rem
.form-group
	margin-bottom 1.25rem
	label
		display block
		font-size 0.9rem
		color #555
		margin-bottom 0.5rem
		font-weight 500
	input
		width 100%
		padding 0.75rem
		border 1px solid #ddd
		border-radius 8px
		font-size 0.95rem
		transition border-color 0.2s ease
		&:focus
			outline none
			border-color #FFC107
		&:disabled
			background #f5f5f5
			color #999
.checkbox-group
	margin-bottom 1rem
	label
		display flex
		align-items center
		cursor pointer
		font-size 0.95rem
		color #333
		input
			margin-right 0.5rem
			width 18px
			height 18px
			cursor pointer
.save-status
	font-size 0.85rem
	font-weight 500
	.status-saving
		color #888
	.status-saved
		color #4CAF50
		animation fadeInOut 2s ease forwards
	.status-error
		color #dc3545
.account-card
	.account-description
		color #666
		margin-bottom 1.5rem
		font-size 0.95rem
.logout-btn
	width 100%
	padding 0.875rem
	background linear-gradient(135deg, #dc3545 0%, #c82333 100%)
	color white
	border none
	border-radius 8px
	font-size 1rem
	font-weight 600
	cursor pointer
	transition all 0.2s ease
	&:hover
		transform translateY(-1px)
		box-shadow 0 4px 12px rgba(220, 53, 69, 0.3)
@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)
@keyframes fadeInOut
	0%
		opacity 0
	10%
		opacity 1
	90%
		opacity 1
	100%
		opacity 0
</style>