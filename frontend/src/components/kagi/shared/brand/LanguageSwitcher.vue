<template>
	<div class="language-switcher">
		<button class="language-button" @click="toggleDropdown">
			<Icon name="globe" :size="18" />
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
	display inline-block
.language-button
	display flex
	align-items center
	gap 0.5rem
	padding 0.5rem 1rem
	background white
	border 2px solid #FFC107
	border-radius 25px
	cursor pointer
	font-size 0.9rem
	transition all 0.3s ease
	&:hover
		background #FFF9C4
	.arrow
		font-size 0.7rem
		color #666
.language-dropdown
	position absolute
	top calc(100% + 0.5rem)
	right 0
	background white
	border 2px solid #FFC107
	border-radius 10px
	overflow hidden
	box-shadow 0 4px 10px rgba(0,0,0,0.1)
	min-width 150px
	z-index 1000
.language-option
	width 100%
	padding 0.75rem 1rem
	border none
	background white
	cursor pointer
	text-align left
	transition all 0.3s ease
	&:hover
		background #FFF9C4
	&.active
		background #FFC107
		font-weight 600
</style>
