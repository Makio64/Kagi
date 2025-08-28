<template>
	<div class="language-switcher">
		<button class="language-button" @click="toggleDropdown">
			<span>{{ currentLanguageLabel }}</span>
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

<script setup>
import { computed, ref } from 'vue'
import { loadTranslations } from 'vue-tiny-translation'

const isOpen = ref( false )

const languages = [
	{ code: 'en', label: 'English' },
	{ code: 'fr', label: 'Français' },
	{ code: 'ja', label: '日本語' }
]

// Get current language from localStorage or default to 'en'
const currentLang = ref( localStorage.getItem( 'kagi_language' ) || 'en' )

const currentLanguageLabel = computed( () => {
	const lang = languages.find( l => l.code === currentLang.value )
	return lang ? lang.label : 'English'
} )

const toggleDropdown = () => {
	isOpen.value = !isOpen.value
}

const changeLanguage = async ( lang ) => {
	await loadTranslations( `/translations/${lang}.json` )
	localStorage.setItem( 'kagi_language', lang )
	currentLang.value = lang
	isOpen.value = false
}

// Click outside to close
onMounted( () => {
	const handleClickOutside = ( e ) => {
		if ( !e.target.closest( '.language-switcher' ) ) {
			isOpen.value = false
		}
	}
	document.addEventListener( 'click', handleClickOutside )

	onUnmounted( () => {
		document.removeEventListener( 'click', handleClickOutside )
	} )
} )
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
