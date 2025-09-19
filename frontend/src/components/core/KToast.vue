<template>
	<transition-group name="toast" tag="div" class="k-toast-container" :class="positionClass">
		<div
			v-for="toast in toasts"
			:key="toast.id"
			class="k-toast"
			:class="[`k-toast--${toast.type}`, { 'k-toast--closable': toast.closable }]"
			role="alert"
			:aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
			@click="toast.closable ? removeToast(toast.id) : null"
		>
			<span class="k-toast__icon" aria-hidden="true">{{ getIcon(toast.type) }}</span>
			<div class="k-toast__content">
				<strong v-if="toast.title" class="k-toast__title">{{ toast.title }}</strong>
				<p class="k-toast__message">{{ toast.message }}</p>
			</div>
			<button
				v-if="toast.closable"
				class="k-toast__close"
				:aria-label="`Close ${toast.type} notification`"
				@click.stop="removeToast(toast.id)"
			>
				✕
			</button>
			<div
				v-if="toast.duration"
				class="k-toast__progress"
				:style="{ animationDuration: `${toast.duration}ms` }"
			/>
		</div>
	</transition-group>
</template>

<script>
let toastId = 0

export default {
	name: 'KToast',
	props: {
		position: {
			type: String,
			default: 'top-right',
			validator: value => [
				'top-left', 'top-center', 'top-right',
				'bottom-left', 'bottom-center', 'bottom-right'
			].includes( value )
		},
		maxToasts: {
			type: Number,
			default: 5
		}
	},
	data() {
		return {
			toasts: []
		}
	},
	computed: {
		positionClass() {
			return `k-toast-container--${this.position}`
		}
	},
	mounted() {
		// Create global toast method
		this.createGlobalToast()
	},
	methods: {
		getIcon( type ) {
			const icons = {
				success: '✓',
				error: '✕',
				warning: '⚠',
				info: 'ℹ'
			}
			return icons[type] || 'ℹ'
		},
		addToast( options ) {
			// Validate options
			if ( typeof options === 'string' ) {
				options = { message: options }
			}

			const toast = {
				id: ++toastId,
				type: options.type || 'info',
				title: options.title || '',
				message: options.message || '',
				duration: options.duration !== undefined ? options.duration : 4000,
				closable: options.closable !== undefined ? options.closable : true
			}

			// Add toast to beginning of array (newest first)
			this.toasts.unshift( toast )

			// Remove oldest toasts if exceeding max
			if ( this.toasts.length > this.maxToasts ) {
				this.toasts = this.toasts.slice( 0, this.maxToasts )
			}

			// Auto remove after duration
			if ( toast.duration ) {
				setTimeout( () => {
					this.removeToast( toast.id )
				}, toast.duration )
			}

			return toast.id
		},
		removeToast( id ) {
			const index = this.toasts.findIndex( t => t.id === id )
			if ( index > -1 ) {
				this.toasts.splice( index, 1 )
			}
		},
		clear() {
			this.toasts = []
		},
		// Helper methods for different toast types
		success( message, options = {} ) {
			return this.addToast( { ...options, message, type: 'success' } )
		},
		error( message, options = {} ) {
			return this.addToast( { ...options, message, type: 'error' } )
		},
		warning( message, options = {} ) {
			return this.addToast( { ...options, message, type: 'warning' } )
		},
		info( message, options = {} ) {
			return this.addToast( { ...options, message, type: 'info' } )
		},
		createGlobalToast() {
			// Create a global $toast instance on Vue prototype
			if ( this.$root && !this.$root.$toast ) {
				this.$root.$toast = {
					success: this.success.bind( this ),
					error: this.error.bind( this ),
					warning: this.warning.bind( this ),
					info: this.info.bind( this ),
					add: this.addToast.bind( this ),
					remove: this.removeToast.bind( this ),
					clear: this.clear.bind( this )
				}
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.k-toast-container
	position fixed
	z-index 9999
	pointer-events none
	display flex
	flex-direction column
	gap 0.75rem
	padding 1rem

	// Position variants
	&--top-left
		top 0
		left 0
		align-items flex-start

	&--top-center
		top 0
		left 50%
		transform translateX(-50%)
		align-items center

	&--top-right
		top 0
		right 0
		align-items flex-end

	&--bottom-left
		bottom 0
		left 0
		align-items flex-start

	&--bottom-center
		bottom 0
		left 50%
		transform translateX(-50%)
		align-items center

	&--bottom-right
		bottom 0
		right 0
		align-items flex-end

.k-toast
	display flex
	align-items flex-start
	gap 0.75rem
	min-width 300px
	max-width 500px
	padding 1rem
	background white
	border-radius 12px
	box-shadow 0 4px 12px rgba(0, 0, 0, 0.15)
	pointer-events all
	position relative
	overflow hidden
	transition all 0.3s ease

	@media (max-width: 480px)
		min-width 250px
		max-width calc(100vw - 2rem)

	&--closable
		cursor pointer

		&:hover
			transform translateX(-5px)
			box-shadow 0 6px 16px rgba(0, 0, 0, 0.2)

	// Type variants
	&--success
		border-left 4px solid #4CAF50

		.k-toast__icon
			color #4CAF50

		.k-toast__progress
			background #4CAF50

	&--error
		border-left 4px solid #F44336

		.k-toast__icon
			color #F44336

		.k-toast__progress
			background #F44336

	&--warning
		border-left 4px solid #FF9800

		.k-toast__icon
			color #FF9800

		.k-toast__progress
			background #FF9800

	&--info
		border-left 4px solid #2196F3

		.k-toast__icon
			color #2196F3

		.k-toast__progress
			background #2196F3

.k-toast__icon
	font-size 1.5rem
	flex-shrink 0
	width 30px
	height 30px
	display flex
	align-items center
	justify-content center
	border-radius 50%
	background currentColor
	color white

	&::before
		content attr(aria-hidden)
		color white
		font-weight bold

.k-toast__content
	flex 1
	min-width 0

.k-toast__title
	display block
	margin-bottom 0.25rem
	color #333
	font-weight 600
	font-size 1rem

.k-toast__message
	margin 0
	color #666
	font-size 0.95rem
	line-height 1.4
	word-break break-word

.k-toast__close
	flex-shrink 0
	width 24px
	height 24px
	display flex
	align-items center
	justify-content center
	background transparent
	border none
	color #999
	font-size 1.2rem
	cursor pointer
	border-radius 50%
	transition all 0.2s
	margin-left auto

	&:hover
		background rgba(0, 0, 0, 0.05)
		color #333

.k-toast__progress
	position absolute
	bottom 0
	left 0
	right 0
	height 3px
	background currentColor
	opacity 0.3
	animation toast-progress linear forwards

@keyframes toast-progress
	from
		transform scaleX(1)
		transform-origin left
	to
		transform scaleX(0)
		transform-origin left

// Transition animations
.toast-enter-active
	animation toast-slide-in 0.3s ease-out

.toast-leave-active
	animation toast-slide-out 0.3s ease-in

@keyframes toast-slide-in
	from
		opacity 0
		transform translateX(100px)
	to
		opacity 1
		transform translateX(0)

@keyframes toast-slide-out
	from
		opacity 1
		transform translateX(0)
	to
		opacity 0
		transform translateX(100px)

// Left side animations
.k-toast-container--top-left,
.k-toast-container--bottom-left
	.toast-enter-active
		animation toast-slide-in-left 0.3s ease-out

	.toast-leave-active
		animation toast-slide-out-left 0.3s ease-in

@keyframes toast-slide-in-left
	from
		opacity 0
		transform translateX(-100px)
	to
		opacity 1
		transform translateX(0)

@keyframes toast-slide-out-left
	from
		opacity 1
		transform translateX(0)
	to
		opacity 0
		transform translateX(-100px)

// Center animations
.k-toast-container--top-center,
.k-toast-container--bottom-center
	.toast-enter-active
		animation toast-fade-in 0.3s ease-out

	.toast-leave-active
		animation toast-fade-out 0.3s ease-in

@keyframes toast-fade-in
	from
		opacity 0
		transform translateY(-20px)
	to
		opacity 1
		transform translateY(0)

@keyframes toast-fade-out
	from
		opacity 1
		transform translateY(0)
	to
		opacity 0
		transform translateY(-20px)
</style>