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
				<h3>{{ $t('dashboard.profile.personalInfo') }}</h3>
				<form @submit.prevent="saveProfile">
					<div class="form-group">
						<label>{{ $t('dashboard.profile.name') }}</label>
						<input v-model="profileForm.name" type="text" required>
					</div>
					<div class="form-group">
						<label>{{ $t('dashboard.profile.email') }}</label>
						<input v-model="profileForm.email" type="email" disabled>
					</div>
					<div class="form-group">
						<label>{{ $t('dashboard.profile.phone') }}</label>
						<input v-model="profileForm.phone" type="tel">
					</div>
					<div class="form-group">
						<label>{{ $t('dashboard.profile.unit') }}</label>
						<input v-model="profileForm.unit" type="text" disabled>
					</div>
					<button type="submit" class="save-btn">
						{{ $t('common.save') }}
					</button>
				</form>
			</div>
			<!-- Emergency Contact -->
			<div class="profile-card">
				<h3>{{ $t('dashboard.profile.emergencyContact') }}</h3>
				<form @submit.prevent="saveEmergencyContact">
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
					<button type="submit" class="save-btn">
						{{ $t('common.save') }}
					</button>
				</form>
			</div>
			<!-- Notification Preferences -->
			<div class="profile-card">
				<h3>{{ $t('dashboard.profile.notificationPreferences') }}</h3>
				<form @submit.prevent="savePreferences">
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
					<button type="submit" class="save-btn">
						{{ $t('common.save') }}
					</button>
				</form>
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
				name: store.user.value?.profile?.name || '',
				email: store.user.value?.email || '',
				phone: store.user.value?.profile?.phone || '',
				unit: store.user.value?.profile?.unit || ''
			},
			emergencyForm: {
				name: '',
				phone: '',
				relationship: ''
			},
			preferences: {
				emailNotifications: true,
				smsNotifications: false
			}
		}
	},
	methods: {
		saveProfile() {
			console.log( 'Saving profile:', this.profileForm )
			alert( this.$t( 'dashboard.profile.saved' ) )
		},
		saveEmergencyContact() {
			console.log( 'Saving emergency contact:', this.emergencyForm )
			alert( this.$t( 'dashboard.profile.emergencySaved' ) )
		},
		savePreferences() {
			console.log( 'Saving preferences:', this.preferences )
			alert( this.$t( 'dashboard.profile.preferencesSaved' ) )
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
.save-btn
	width 100%
	padding 0.875rem
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
	color #333
	border none
	border-radius 8px
	font-size 1rem
	font-weight 600
	cursor pointer
	transition all 0.2s ease
	&:hover
		transform translateY(-1px)
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.3)
@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)
</style>