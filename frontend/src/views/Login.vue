<template>
	<div class="login-page">
		<div class="language-switcher-container">
			<LanguageSwitcher />
		</div>
		<div class="login-container">
			<div class="login-card">
				<div class="logo-section">
					<KagiLogo :size="80" color="#333" />
					<h1>{{ $t('app.name') }}</h1>
					<p class="tagline">{{ $t('app.tagline') }}</p>
				</div>

				<div class="login-tabs">
					<button
						:class="['tab', { active: activeTab === 'resident' }]"
						@click="activeTab = 'resident'"
					>
						{{ $t('login.tabs.resident') }}
					</button>
					<button
						:class="['tab', { active: activeTab === 'admin' }]"
						@click="activeTab = 'admin'"
					>
						{{ $t('login.tabs.admin') }}
					</button>
				</div>

				<div class="login-form">
					<!-- Resident Login (Magic Link) -->
					<div v-if="activeTab === 'resident'" class="form-content">
						<h2>{{ $t('login.resident.title') }}</h2>
						<p class="form-description">
							{{ $t('login.resident.description') }}
						</p>

						<form @submit.prevent="requestMagicLink">
							<div class="form-group">
								<label for="email">{{ $t('login.resident.email') }}</label>
								<input
									id="email"
									v-model="residentEmail"
									type="email"
									:placeholder="$t('login.resident.emailPlaceholder')"
									autocomplete="email"
									required
								>
							</div>

							<button
								type="submit"
								class="submit-btn"
								:disabled="loading || magicLinkSent"
							>
								<span v-if="loading">{{ $t('login.resident.sending') }}</span>
								<span v-else-if="magicLinkSent">{{ $t('login.resident.linkSent') }}</span>
								<span v-else>{{ $t('login.resident.sendLink') }}</span>
							</button>
						</form>

						<div v-if="magicLinkSent" class="success-message">
							<p>{{ $t('login.resident.success.title') }}</p>
							<p class="small">{{ $t('login.resident.success.description') }}</p>
						</div>
					</div>

					<!-- Admin Login (Password) -->
					<div v-else class="form-content">
						<h2>{{ $t('login.admin.title') }}</h2>
						<p class="form-description">
							{{ $t('login.admin.description') }}
						</p>

						<form @submit.prevent="adminLogin">
							<div class="form-group">
								<label for="admin-email">{{ $t('login.admin.email') }}</label>
								<input
									id="admin-email"
									v-model="adminEmail"
									type="email"
									:placeholder="$t('login.admin.emailPlaceholder')"
									autocomplete="username"
									required
								>
							</div>

							<div class="form-group">
								<label for="password">{{ $t('login.admin.password') }}</label>
								<input
									id="password"
									v-model="adminPassword"
									type="password"
									:placeholder="$t('login.admin.passwordPlaceholder')"
									autocomplete="current-password"
									required
								>
							</div>

							<button
								type="submit"
								class="submit-btn"
								:disabled="loading"
							>
								<span v-if="loading">{{ $t('login.admin.loggingIn') }}</span>
								<span v-else>{{ $t('login.admin.login') }}</span>
							</button>
						</form>
					</div>
				</div>

				<div v-if="error" class="error-message">
					{{ error }}
				</div>

				<div class="login-footer">
					<a href="/" class="back-link">
						← {{ $t('nav.backToHome') }}
					</a>
				</div>
			</div>
		</div>

		<!-- Email Popup for Test Mode -->
		<EmailPopup
			:show="showEmailPopup"
			:email="residentEmail"
			:token="magicLinkToken"
			@close="showEmailPopup = false"
		/>
	</div>
</template>

<script>
import * as store from '../store'

export default {
	name: 'Login',
	data() {
		return {
			activeTab: 'resident',
			residentEmail: 'resident@kagi.com',
			adminEmail: '',
			adminPassword: '',
			loading: false,
			error: '',
			magicLinkSent: false,
			showEmailPopup: false,
			magicLinkToken: ''
		}
	},
	async mounted() {
		// Check for magic link token in URL
		const urlParams = new URLSearchParams( window.location.search )
		const token = urlParams.get( 'token' )
		if ( token ) {
			this.loading = true
			try {
				await store.verifyMagicLink( token )
				// Magic link is only used for residents, always redirect to /dashboard
				this.$router.push( '/dashboard' )
			} catch {
				this.error = this.$t( 'login.errors.invalidLink' )
			} finally {
				this.loading = false
			}
		}
	},
	methods: {
		async requestMagicLink() {
			this.loading = true
			this.error = ''
			try {
				const result = await store.requestMagicLink( this.residentEmail )

				// In mock mode, immediately redirect to appropriate dashboard
				if ( result.mockLogin ) {
					// Resident tab always goes to /dashboard
					this.$router.push( '/dashboard' )
					return
				}

				if ( result.token ) {
					// In test mode, show the popup with the magic link
					this.magicLinkToken = result.token
					this.showEmailPopup = true
				}
				this.magicLinkSent = true
				setTimeout( () => {
					this.magicLinkSent = false
				}, 10000 )
			} catch {
				this.error = this.$t( 'login.errors.sendFailed' )
			} finally {
				this.loading = false
			}
		},
		async adminLogin() {
			this.loading = true
			this.error = ''
			try {
				await store.adminLogin( this.adminEmail, this.adminPassword )

				// Admin login always goes to mansion dashboard, except for specific "admin" email
				if ( this.adminEmail === 'admin' || this.adminEmail === 'admin@kagi.com' ) {
					this.$router.push( '/admin-dashboard' )  // Only for exact "admin" email
				} else {
					this.$router.push( '/mansion-dashboard' )  // All other admin logins go to mansion dashboard
				}
			} catch {
				this.error = this.$t( 'login.errors.invalidCredentials' )
			} finally {
				this.loading = false
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
.login-page
	min-height 100vh
	display flex
	align-items center
	justify-content center
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	padding 2rem
	padding-top calc(2rem + var(--sait, 0px))
	position relative

.language-switcher-container
	position absolute
	top calc(2rem + var(--sait, 0px))
	right calc(2rem + var(--sair, 0px))
	z-index 100

.login-container
	width 100%
	max-width 450px

.login-card
	background white
	border-radius 20px
	box-shadow 0 20px 60px rgba(0,0,0,0.1)
	overflow hidden

.logo-section
	text-align center
	padding 3rem 2rem 2rem
	background linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)

	.key-logo
		animation float 3s ease-in-out infinite

	h1
		font-size 2.5rem
		color #333
		margin 1rem 0 0.5rem
		letter-spacing 0.05em

	.tagline
		color #666
		font-size 1rem

@keyframes float
	0%, 100%
		transform translateY(0)
	50%
		transform translateY(-5px)

.login-tabs
	display flex
	background #f5f5f5

	.tab
		flex 1
		padding 1rem
		border none
		background transparent
		cursor pointer
		font-size 0.95rem
		color #666
		transition all 0.3s ease
		border-bottom 3px solid transparent

		&.active
			background white
			color #333
			border-bottom-color #FFC107
			font-weight 600

		&:hover:not(.active)
			background #efefef

.login-form
	padding 2rem

.form-content
	h2
		font-size 1.5rem
		color #333
		margin-bottom 0.5rem

	.form-description
		color #666
		font-size 0.9rem
		margin-bottom 2rem
		line-height 1.5

.form-group
	margin-bottom 1.5rem

	label
		display block
		font-size 0.9rem
		color #555
		margin-bottom 0.5rem
		font-weight 500

	input
		width 100%
		box-sizing: border-box;
		padding 0.75rem 1rem
		border 2px solid #e0e0e0
		border-radius 10px
		font-size 1rem
		transition all 0.3s ease

		&:focus
			outline none
			border-color #FFC107
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

.submit-btn
	width 100%
	padding 1rem
	background #FFC107
	color #333
	border none
	border-radius 10px
	font-size 1.1rem
	font-weight 600
	cursor pointer
	transition all 0.3s ease

	&:hover:not(:disabled)
		background #FFB300
		transform translateY(-2px)
		box-shadow 0 5px 15px rgba(255, 193, 7, 0.3)

	&:disabled
		opacity 0.6
		cursor not-allowed

.success-message
	margin-top 1.5rem
	padding 1rem
	background #E8F5E9
	border-radius 10px
	text-align center

	p
		color #2E7D32
		margin 0.25rem 0

		&.small
			font-size 0.85rem
			color #558B2F

.error-message
	margin 1rem 2rem
	padding 1rem
	background #FFEBEE
	color #C62828
	border-radius 10px
	text-align center
	font-size 0.9rem

.login-footer
	padding 1.5rem
	text-align center
	background #f9f9f9

	.back-link
		color #666
		text-decoration none
		font-size 0.9rem
		transition color 0.3s ease

		&:hover
			color #FFC107

@media (max-width: 480px)

	.logo-section h1
		font-size 2rem
</style>
