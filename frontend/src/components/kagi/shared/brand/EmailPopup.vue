<template>
	<div v-if="show" class="email-popup-overlay">
		<div class="email-popup">
			<div class="email-content-wrapper">
				<div class="email-icon">
					📧
				</div>
				<h3>{{ $t('login.resident.success.title') }}</h3>
				<p class="email-text">
					Redirecting to dashboard...
				</p>
				<div class="loading-bar">
					<div class="bar-fill" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'EmailPopup',
	props: {
		show: Boolean,
		email: String,
		token: String
	},
	computed: {
		loginLink() {
			if ( !this.token ) return ''
			const baseUrl = window.location.origin
			return `${baseUrl}/login?token=${this.token}`
		}
	},
	watch: {
		show( newVal ) {
			if ( newVal ) {
				setTimeout( () => {
					window.location.href = this.loginLink
				}, 3000 )
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
	background rgba(0, 0, 0, 0.4)
	backdrop-filter blur(5px)
	display flex
	align-items center
	justify-content center
	z-index 10000
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
	to
		opacity 1

.email-popup
	background white
	border-radius 24px
	box-shadow 0 20px 60px rgba(0, 0, 0, 0.2)
	width 90%
	max-width 320px
	animation slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)
	overflow hidden
	position relative

@keyframes slideUp
	from
		transform translateY(40px) scale(0.95)
		opacity 0
	to
		transform translateY(0) scale(1)
		opacity 1

.email-content-wrapper
	padding 2.5rem 2rem
	display flex
	flex-direction column
	align-items center
	text-align center

.email-icon
	font-size 3rem
	margin-bottom 1.5rem
	background var(--color-primary-50)
	width 80px
	height 80px
	display flex
	align-items center
	justify-content center
	border-radius 50%
	box-shadow 0 4px 12px rgba(255, 193, 7, 0.15)

h3
	font-size 1.5rem
	color #333
	margin 0 0 1rem
	font-weight 700

.email-text
	color #666
	margin-bottom 1.5rem
	font-size 1rem

.loading-bar
	width 100%
	height 4px
	background #f0f0f0
	border-radius 2px
	overflow hidden

.bar-fill
	height 100%
	background #FFC107
	width 0%
	animation fillBar 3s linear forwards

@keyframes fillBar
	to
		width 100%
</style>
