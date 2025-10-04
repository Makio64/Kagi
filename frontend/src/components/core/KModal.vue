<template>
	<transition name="modal">
		<div v-if="modelValue" class="modal-overlay" @click.self="close">
			<div class="modal-content">
				<div class="modal-header">
					<h3>{{ title }}</h3>
					<button class="modal-close" @click="close">✕</button>
				</div>
				<div class="modal-body">
					<slot />
				</div>
				<div v-if="$slots.footer" class="modal-footer">
					<slot name="footer" />
				</div>
			</div>
		</div>
	</transition>
</template>
<script>
export default {
	name: 'KModal',
	props: {
		modelValue: { type: Boolean, required: true },
		title: { type: String, required: true }
	},
	emits: ['update:modelValue'],
	methods: {
		close() {
			this.$emit( 'update:modelValue', false )
		},
		handleEscape( e ) {
			if ( e.key === 'Escape' && this.modelValue ) {
				this.close()
			}
		}
	},
	mounted() {
		document.addEventListener( 'keydown', this.handleEscape )
	},
	beforeUnmount() {
		document.removeEventListener( 'keydown', this.handleEscape )
	}
}
</script>
<style lang="stylus" scoped>
.modal-overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	background rgba(0, 0, 0, 0.5)
	display flex
	align-items center
	justify-content center
	z-index 1000
	padding 1rem
.modal-content
	background white
	border-radius 12px
	width 100%
	max-width 600px
	max-height 90vh
	overflow-y auto
	box-shadow 0 10px 40px rgba(0, 0, 0, 0.2)
.modal-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	border-bottom 1px solid #e0e0e0
	h3
		margin 0
		color #333
.modal-close
	background none
	border none
	font-size 1.5rem
	cursor pointer
	color #999
	padding 0
	width 30px
	height 30px
	&:hover
		color #333
.modal-body
	padding 1.5rem
.modal-footer
	padding 1.5rem
	border-top 1px solid #e0e0e0
	display flex
	justify-content flex-end
	gap 1rem
.modal-enter-active, .modal-leave-active
	transition opacity 0.3s
.modal-enter-from, .modal-leave-to
	opacity 0
</style>
