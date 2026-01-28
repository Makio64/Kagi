<template>
	<transition name="slide">
		<div v-if="show" class="mobile-settings-menu">
			<div class="mobile-menu-header">
				<h3>{{ $t('common.settings') }}</h3>
				<button class="close-menu-btn" @click="$emit('close')">✕</button>
			</div>
			<div class="mobile-menu-content">
				<div v-if="user" class="mobile-user-info">
					<div class="user-email">{{ user.email }}</div>
					<div v-if="userRole" class="user-role">{{ userRole }}</div>
				</div>
				<div class="mobile-lang-section">
					<LanguageSwitcher />
				</div>
				<button class="mobile-logout-btn" @click="handleLogout">
					{{ $t('nav.logout') }}
				</button>
				<slot name="extra" />
			</div>
		</div>
	</transition>
</template>
<script>
import * as store from '../../../store'
export default {
	name: 'MobileSettingsMenu',
	props: {
		show: {
			type: Boolean,
			required: true
		},
		user: {
			type: Object,
			default: null
		},
		userRole: {
			type: String,
			default: ''
		}
	},
	emits: ['close', 'logout'],
	methods: {
		async handleLogout() {
			this.$emit( 'logout' )
			await store.logout()
			this.$router.push( '/login' )
		}
	}
}
</script>
<style lang="stylus" scoped>
.mobile-settings-menu
	position fixed
	top 0
	right 0
	width 300px
	max-width 85vw
	height 100vh
	background white
	box-shadow -4px 0 20px rgba(0,0,0,0.1)
	z-index 1000
	display flex
	flex-direction column
.mobile-menu-header
	padding 1.5rem
	background linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)
	color white
	display flex
	justify-content space-between
	align-items center
	h3
		margin 0
		font-size 1.25rem
.close-menu-btn
	background transparent
	border none
	color white
	font-size 1.5rem
	cursor pointer
	padding 0.25rem
	display flex
	align-items center
	justify-content center
	width 32px
	height 32px
	border-radius 50%
	transition background 0.3s ease
	&:hover
		background rgba(255,255,255,0.2)
.mobile-menu-content
	flex 1
	padding 1.5rem
	overflow-y auto
.mobile-user-info
	background #f9f9f9
	border-radius 12px
	margin-bottom 1.5rem
	.user-email
		font-weight 600
		color #333
		margin-bottom 0.25rem
	.user-role
		font-size 0.85rem
		color #666
.mobile-lang-section
	margin-bottom 1.5rem
	padding-bottom 1.5rem
	border-bottom 1px solid #f0f0f0
.mobile-logout-btn
	width 100%
	padding 1rem
	background #FF5252
	color white
	border none
	border-radius 12px
	font-size 1rem
	font-weight 600
	cursor pointer
	transition all 0.3s ease
	&:hover
		background #FF1744
		transform translateY(-2px)
		box-shadow 0 4px 12px rgba(255, 82, 82, 0.3)
// Slide transition
.slide-enter-active,
.slide-leave-active
	transition transform 0.3s ease
.slide-enter-from,
.slide-leave-to
	transform translateX(100%)
</style>
