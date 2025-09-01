<template>
	<div>
		<!-- Header -->
		<header class="header">
			<div class="header-content">
				<div class="header-left" :style="onLogoClick ? 'cursor: pointer;' : ''" @click="handleLogoClick">
					<KagiLogo :size="40" />
					<h1>{{ title }}</h1>
				</div>
				<div class="header-right">
					<span v-if="userBadge" class="user-badge">{{ userBadge }}</span>
					<LanguageSwitcher v-if="showLanguageSwitcher" />
					<button class="user-menu-btn" :class="{ active: showMobileMenu }" @click="showMobileMenu = !showMobileMenu">
						<span class="user-email">{{ userEmail }}</span>
						<span class="menu-arrow">▼</span>
					</button>
				</div>
			</div>
		</header>

		<!-- Mobile Settings Menu -->
		<transition name="slide">
			<div v-if="showMobileMenu" class="mobile-settings-menu">
				<div class="mobile-menu-header">
					<h3>{{ $t('common.settings') || 'Settings' }}</h3>
					<button class="close-menu-btn" @click="showMobileMenu = false">✕</button>
				</div>
				<div class="mobile-menu-content">
					<div class="mobile-user-info">
						<div class="user-email">{{ userEmail }}</div>
						<div class="user-role">{{ userRole }}</div>
					</div>
					<div class="mobile-lang-section">
						<LanguageSwitcher />
					</div>
					<button class="mobile-logout-btn" @click="handleLogout">
						{{ $t('nav.logout') || 'Logout' }}
					</button>
				</div>
			</div>
		</transition>
	</div>
</template>

<script setup>
import { ref } from 'vue'

import KagiLogo from '../KagiLogo.vue'
import LanguageSwitcher from '../LanguageSwitcher.vue'

// Props
const props = defineProps( {
	title: {
		type: String,
		required: true
	},
	userBadge: {
		type: String,
		default: null
	},
	userEmail: {
		type: String,
		required: true
	},
	userRole: {
		type: String,
		required: true
	},
	showLanguageSwitcher: {
		type: Boolean,
		default: false
	},
	onLogoClick: {
		type: Function,
		default: null
	}
} )

// Emits
const emit = defineEmits( ['logout', 'logo-click'] )

// State
const showMobileMenu = ref( false )

// Methods
const handleLogout = () => {
	showMobileMenu.value = false
	emit( 'logout' )
}

const handleLogoClick = () => {
	if ( props.onLogoClick ) {
		props.onLogoClick()
	}
	emit( 'logo-click' )
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.header
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	box-shadow 0 4px 20px rgba(255, 193, 7, 0.15)
	position sticky
	top 0
	z-index 100

.header-content
	max-width 1400px
	margin 0 auto
	padding 1rem 2rem
	display flex
	justify-content space-between
	align-items center

.header-left
	display flex
	align-items center
	gap 1rem
	
	h1
		font-size 1.5rem
		color #333
		margin 0

.header-right
	display flex
	align-items center
	gap 1rem

.user-badge
	padding 0.5rem 1rem
	background #FFC107
	color white
	border-radius 50px
	font-size 0.9rem
	font-weight 600

.user-menu-btn
	display flex
	align-items center
	gap 0.5rem
	padding 0.6rem 1.2rem
	background white
	color #333
	border 2px solid rgba(255, 193, 7, 0.3)
	border-radius 50px
	cursor pointer
	transition all 0.3s ease
	box-shadow 0 2px 10px rgba(255, 193, 7, 0.1)
	font-size 0.95rem
	
	.user-email
		font-weight 500
		max-width 200px
		overflow hidden
		text-overflow ellipsis
		white-space nowrap
		
		@media (max-width: 480px)
			max-width 120px
			font-size 0.9rem
	
	.menu-arrow
		font-size 0.7rem
		transition transform 0.3s ease
	
	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		border-color #FFC107
		box-shadow 0 4px 15px rgba(255, 193, 7, 0.25)
	
	&.active
		.menu-arrow
			transform rotate(180deg)

// Mobile Settings Menu
.mobile-settings-menu
	position fixed
	top 0
	right 0
	width 280px
	height 100vh
	background white
	box-shadow -2px 0 10px rgba(0, 0, 0, 0.15)
	z-index 1000
	display flex
	flex-direction column

.mobile-menu-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-bottom 2px solid #FFC107
	
	h3
		margin 0
		color #333

.close-menu-btn
	background none
	border none
	font-size 1.5rem
	color #666
	cursor pointer
	padding 0
	width 30px
	height 30px
	display flex
	align-items center
	justify-content center
	border-radius 50%
	transition all 0.2s ease
	
	&:hover
		background rgba(0, 0, 0, 0.1)
		color #333

.mobile-menu-content
	flex 1
	padding 1.5rem
	display flex
	flex-direction column
	gap 1.5rem

.mobile-user-info
	background #f9f9f9
	padding 1rem
	border-radius 10px
	
	.user-email
		font-weight 600
		color #333
		margin-bottom 0.5rem
		word-break break-all
	
	.user-role
		font-size 0.9rem
		color #666
		text-transform capitalize

.mobile-lang-section
	padding 1rem 0
	border-top 1px solid #e0e0e0
	border-bottom 1px solid #e0e0e0

.mobile-logout-btn
	width 100%
	padding 1rem
	background white
	color #666
	border 2px solid #e0e0e0
	border-radius 50px
	font-size 1rem
	font-weight 500
	cursor pointer
	transition all 0.3s ease
	margin-top auto
	
	&:hover
		background #f5f5f5
		border-color #999
		color #333

// Slide animation for mobile menu
.slide-enter-active, .slide-leave-active
	transition transform 0.3s ease

.slide-enter-from, .slide-leave-to
	transform translateX(100%)

// Responsive adjustments
@media (max-width: 768px)
	.header-content
		padding 1rem
		
	.header-left h1
		font-size 1.2rem
		
	.user-badge
		display none
</style>