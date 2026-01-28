<template>
	<div :class="['language-switcher', { 'language-switcher--compact': variant === 'compact' }]">
		<button class="language-button" @click="toggleDropdown">
			<Icon v-if="variant === 'compact'" name="globe" :size="18" />
			<span v-else class="language-label">{{ currentLanguageLabel }}</span>
			<span class="arrow">{{ isOpen ? '▲' : '▼' }}</span>
		</button>
		<div v-if="isOpen" class="language-dropdown">
			<button
				v-for="lang in languages"
				:key="lang.code"
				:class="['language-option', { active: currentLang === lang.code }]"
				@click="changeLanguage(lang.code)"
			>
				{{ lang.label }}
			</button>
		</div>
	</div>
</template>
<script>
import { loadTranslations } from 'vue-tiny-translation'
export default {
	name: 'LanguageSwitcher',
	props: {
		variant: {
			type: String,
			default: 'full',
			validator: ( value ) => [ 'compact', 'full' ].includes( value )
		}
	},
	data() {
		return {
			isOpen: false,
			languages: [
				{ code: 'en', label: 'English' },
				{ code: 'fr', label: 'Français' },
				{ code: 'ja', label: '日本語' }
			],
			currentLang: localStorage.getItem( 'kagi_language' ) || 'en'
		}
	},
	computed: {
		currentLanguageLabel() {
			const lang = this.languages.find( l => l.code === this.currentLang )
			return lang ? lang.label : 'English'
		}
	},
	mounted() {
		const handleClickOutside = ( e ) => {
			if ( !e.target.closest( '.language-switcher' ) ) {
				this.isOpen = false
			}
		}
		document.addEventListener( 'click', handleClickOutside )
		this._handleClickOutside = handleClickOutside
	},
	unmounted() {
		if ( this._handleClickOutside ) {
			document.removeEventListener( 'click', this._handleClickOutside )
		}
	},
	methods: {
		toggleDropdown() {
			this.isOpen = !this.isOpen
		},
		async changeLanguage( lang ) {
			await loadTranslations( `/translations/${lang}.json` )
			localStorage.setItem( 'kagi_language', lang )
			this.currentLang = lang
			this.isOpen = false
		}
	}
}
</script>
<style lang="stylus" scoped>
.language-switcher
	position relative
	width 100%
.language-button
	display flex
	align-items center
	justify-content space-between
	width 100%
	padding 0.5rem 1rem
	background rgba(0, 0, 0, 0.05)
	border none
	border-radius 8px
	cursor pointer
	font-size 0.875rem
	font-weight 500
	color #616161
	transition all 0.2s ease
	&:hover
		background rgba(0, 0, 0, 0.08)
		color #424242
	.language-label
		flex 1
		text-align center
	.arrow
		font-size 0.6rem
		color #888
.language-dropdown
	position absolute
	top calc(100% + 0.5rem)
	left 0
	right 0
	background white
	border 1px solid #e0e0e0
	border-radius 8px
	overflow hidden
	box-shadow 0 4px 12px rgba(0,0,0,0.1)
	z-index 1000
.language-option
	width 100%
	padding 0.625rem 1rem
	border none
	background white
	cursor pointer
	text-align left
	font-size 0.875rem
	color #616161
	transition all 0.2s ease
	&:hover
		background rgba(0, 0, 0, 0.05)
	&.active
		background #FFC107
		color #333
		font-weight 600

// Compact variant (for login page)
.language-switcher--compact
	display inline-block
	width auto
	.language-button
		gap 0.5rem
		width auto
		padding 0.5rem 1rem
		background white
		border 2px solid #FFC107
		border-radius 25px
		justify-content flex-start
		&:hover
			background #FFF9C4
		.arrow
			font-size 0.7rem
			color #666
	.language-dropdown
		min-width 150px
		left auto
		border 2px solid #FFC107
		border-radius 10px
	.language-option
		padding 0.75rem 1rem
		&:hover
			background #FFF9C4
</style>
