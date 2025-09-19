<template>
	<transition name="modal" @after-enter="onAfterEnter" @before-leave="onBeforeLeave">
		<div
			v-if="modelValue"
			class="modal-overlay"
			role="dialog"
			:aria-modal="true"
			:aria-labelledby="titleId"
			:aria-describedby="bodyId"
			@click.self="handleClose"
			@keydown="handleKeydown"
		>
			<div
				ref="modalContent"
				class="modal-content"
				:class="sizeClass"
				tabindex="-1"
			>
				<div class="modal-header">
					<h3 :id="titleId">{{ title }}</h3>
					<button
						v-if="showCloseButton"
						class="modal-close"
						:aria-label="closeButtonLabel || 'Close dialog'"
						@click="handleClose"
					>
						✕
					</button>
				</div>

				<div :id="bodyId" class="modal-body">
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
		modelValue: {
			type: Boolean,
			required: true
		},
		title: {
			type: String,
			required: true
		},
		size: {
			type: String,
			default: 'medium',
			validator: value => ['small', 'medium', 'large', 'fullscreen'].includes( value )
		},
		showCloseButton: {
			type: Boolean,
			default: true
		},
		closeOnEscape: {
			type: Boolean,
			default: true
		},
		closeOnClickOutside: {
			type: Boolean,
			default: true
		},
		closeButtonLabel: {
			type: String,
			default: ''
		},
		focusTrap: {
			type: Boolean,
			default: true
		}
	},
	emits: ['update:modelValue', 'close', 'open'],
	data() {
		return {
			previousActiveElement: null,
			focusableElements: [],
			titleId: `modal-title-${Math.random().toString( 36 ).substr( 2, 9 )}`,
			bodyId: `modal-body-${Math.random().toString( 36 ).substr( 2, 9 )}`
		}
	},
	computed: {
		sizeClass() {
			return `modal-${this.size}`
		}
	},
	watch: {
		modelValue( newVal ) {
			if ( newVal ) {
				this.$nextTick( () => {
					this.initFocusTrap()
				} )
			}
		}
	},
	mounted() {
		if ( this.closeOnEscape ) {
			document.addEventListener( 'keydown', this.handleEscape )
		}
	},
	beforeUnmount() {
		if ( this.closeOnEscape ) {
			document.removeEventListener( 'keydown', this.handleEscape )
		}
		this.restoreFocus()
	},
	methods: {
		handleClose( event ) {
			if ( this.closeOnClickOutside || ( event && event.target.classList.contains( 'modal-close' ) ) ) {
				this.$emit( 'update:modelValue', false )
				this.$emit( 'close' )
			}
		},
		handleEscape( e ) {
			if ( e.key === 'Escape' && this.modelValue ) {
				this.handleClose()
			}
		},
		handleKeydown( e ) {
			if ( !this.focusTrap ) return

			if ( e.key === 'Tab' ) {
				this.trapTabKey( e )
			}
		},
		onAfterEnter() {
			// Store the previously focused element
			this.previousActiveElement = document.activeElement

			// Focus the modal content
			if ( this.$refs.modalContent ) {
				this.$refs.modalContent.focus()
			}

			// Get focusable elements
			this.updateFocusableElements()

			this.$emit( 'open' )
		},
		onBeforeLeave() {
			this.restoreFocus()
		},
		initFocusTrap() {
			if ( !this.focusTrap ) return

			// Add inert to body elements except modal
			const bodyChildren = document.body.children
			for ( let child of bodyChildren ) {
				if ( child !== this.$el && !child.hasAttribute( 'inert' ) ) {
					child.setAttribute( 'inert', '' )
					child.setAttribute( 'data-modal-inert', '' )
				}
			}
		},
		restoreFocus() {
			// Remove inert from body elements
			const inertElements = document.querySelectorAll( '[data-modal-inert]' )
			inertElements.forEach( el => {
				el.removeAttribute( 'inert' )
				el.removeAttribute( 'data-modal-inert' )
			} )

			// Restore focus to previous element
			if ( this.previousActiveElement && this.previousActiveElement.focus ) {
				this.previousActiveElement.focus()
			}
		},
		updateFocusableElements() {
			if ( !this.$refs.modalContent ) return

			const focusableSelectors = [
				'a[href]',
				'button:not([disabled])',
				'input:not([disabled])',
				'textarea:not([disabled])',
				'select:not([disabled])',
				'[tabindex]:not([tabindex="-1"])'
			]

			this.focusableElements = this.$refs.modalContent.querySelectorAll(
				focusableSelectors.join( ', ' )
			)
		},
		trapTabKey( e ) {
			this.updateFocusableElements()

			if ( this.focusableElements.length === 0 ) return

			const firstFocusable = this.focusableElements[0]
			const lastFocusable = this.focusableElements[this.focusableElements.length - 1]

			if ( e.shiftKey ) {
				// Shift + Tab
				if ( document.activeElement === firstFocusable ) {
					e.preventDefault()
					lastFocusable.focus()
				}
			} else {
				// Tab
				if ( document.activeElement === lastFocusable ) {
					e.preventDefault()
					firstFocusable.focus()
				}
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

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
	max-height 90vh
	overflow-y auto
	box-shadow 0 10px 40px rgba(0, 0, 0, 0.2)
	display flex
	flex-direction column

	&.modal-small
		max-width 400px

	&.modal-medium
		max-width 600px

	&.modal-large
		max-width 900px

	&.modal-fullscreen
		max-width 95vw
		max-height 95vh

.modal-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	border-bottom 1px solid #e0e0e0

	h3
		margin 0
		color #333
		font-size 1.3rem

.modal-close
	background none
	border none
	font-size 1.5rem
	cursor pointer
	color #999
	padding 0
	width 30px
	height 30px
	display flex
	align-items center
	justify-content center
	border-radius 50%
	transition all 0.2s

	&:hover
		background #f5f5f5
		color #333

.modal-body
	padding 1.5rem
	flex 1
	overflow-y auto

.modal-footer
	padding 1.5rem
	border-top 1px solid #e0e0e0
	display flex
	justify-content flex-end
	gap 1rem

// Animation
.modal-enter-active, .modal-leave-active
	transition opacity 0.3s

.modal-enter-from, .modal-leave-to
	opacity 0

.modal-enter-active .modal-content
	animation slideUp 0.3s ease-out

@keyframes slideUp
	from
		transform translateY(30px)
		opacity 0
	to
		transform translateY(0)
		opacity 1
</style>