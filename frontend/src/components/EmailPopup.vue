<template>
	<div v-if="show" class="email-popup-overlay" @click.self="close">
		<div class="email-popup">
			<div class="email-header">
				<h3>📧 {{ $t('login.resident.success.title') }}</h3>
				<button class="close-btn" @click="close">✕</button>
			</div>
			<div class="email-body">
				<p class="test-notice">⚠️ TEST MODE - Email not sent via SMTP</p>
				<div class="email-field">
					<label>To:</label>
					<span>{{ email }}</span>
				</div>
				<div class="email-field">
					<label>Subject:</label>
					<span>Your Kagi Login Link</span>
				</div>
				<div class="email-content">
					<p>Click the link below to login to Kagi:</p>
					<div class="link-container">
						<a :href="loginLink" target="_blank" class="magic-link">
							{{ loginLink }}
						</a>
						<button class="copy-btn" @click="copyLink">
							{{ copied ? '✓ Copied!' : '📋 Copy' }}
						</button>
					</div>
					<p class="link-expiry">This link expires in 15 minutes.</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'EmailPopup',
	emits: ['close'],
	props: {
		show: Boolean,
		email: String,
		token: String
	},
	data() {
		return {
			copied: false
		}
	},
	computed: {
		loginLink() {
			if ( !this.token ) return ''
			const baseUrl = window.location.origin
			return `${baseUrl}/login?token=${this.token}`
		}
	},
	methods: {
		close() {
			this.$emit( 'close' )
		},
		async copyLink() {
			try {
				await navigator.clipboard.writeText( this.loginLink )
				this.copied = true
				setTimeout( () => {
					this.copied = false
				}, 2000 )
			} catch ( err ) {
				console.error( 'Failed to copy:', err )
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
.email-popup-overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	background rgba(0, 0, 0, 0.6)
	display flex
	align-items center
	justify-content center
	z-index 10000
	animation fadeIn 0.2s ease

@keyframes fadeIn
	from
		opacity 0
	to
		opacity 1

.email-popup
	background white
	border-radius 15px
	box-shadow 0 20px 60px rgba(0, 0, 0, 0.3)
	width 90%
	max-width 600px
	animation slideUp 0.3s ease

@keyframes slideUp
	from
		transform translateY(20px)
		opacity 0
	to
		transform translateY(0)
		opacity 1

.email-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	border-bottom 2px solid #f0f0f0
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-radius 15px 15px 0 0

	h3
		margin 0
		color #333
		font-size 1.3rem

.close-btn
	background none
	border none
	font-size 1.5rem
	color #666
	cursor pointer
	padding 0.25rem
	width 32px
	height 32px
	border-radius 50%
	display flex
	align-items center
	justify-content center
	transition all 0.2s ease

	&:hover
		background rgba(0, 0, 0, 0.1)
		color #333

.email-body
	padding 1.5rem

.test-notice
	background #FFF3E0
	color #F57C00
	padding 0.75rem
	border-radius 8px
	text-align center
	font-weight 600
	margin-bottom 1.5rem
	border 1px solid #FFE0B2

.email-field
	display flex
	gap 1rem
	margin-bottom 1rem
	padding-bottom 1rem
	border-bottom 1px solid #f0f0f0

	label
		font-weight 600
		color #666
		min-width 80px

	span
		color #333

.email-content
	margin-top 1.5rem
	padding 1.5rem
	background #f9f9f9
	border-radius 10px

	p
		color #666
		margin 1rem 0

.link-container
	display flex
	align-items center
	gap 1rem
	margin 1.5rem 0
	padding 1rem
	background white
	border 2px solid #FFC107
	border-radius 8px

.magic-link
	flex 1
	color #2196F3
	text-decoration none
	word-break break-all
	font-family monospace
	font-size 0.9rem

	&:hover
		text-decoration underline

.copy-btn
	padding 0.5rem 1rem
	background #FFC107
	color #333
	border none
	border-radius 6px
	font-weight 600
	cursor pointer
	white-space nowrap
	transition all 0.2s ease

	&:hover
		background #FFB300
		transform translateY(-1px)

.link-expiry
	text-align center
	color #999
	font-size 0.85rem
	margin-top 1.5rem

@media (max-width: 600px)
	.email-popup
		width 95%
		margin 1rem

	.link-container
		flex-direction column
		align-items stretch

	.copy-btn
		width 100%
</style>