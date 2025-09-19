<template>
	<div class="k-select-wrapper">
		<label v-if="label" :for="selectId" class="k-select-label">
			{{ label }}
			<span v-if="required" class="required" aria-label="required">*</span>
		</label>
		<div class="k-select-container" :class="{ 'has-error': error }">
			<button
				:id="selectId"
				type="button"
				class="k-select-trigger"
				:class="{
					'is-open': isOpen,
					'is-disabled': disabled,
					'has-value': hasValue
				}"
				:disabled="disabled"
				:aria-expanded="isOpen"
				:aria-haspopup="listbox"
				:aria-controls="listId"
				:aria-labelledby="label ? undefined : selectId"
				:aria-describedby="ariaDescribedBy"
				:aria-invalid="!!error"
				:aria-required="required"
				@click="toggleDropdown"
				@keydown="handleTriggerKeydown"
			>
				<span class="k-select-value">
					{{ displayValue || placeholder || 'Select...' }}
				</span>
				<span class="k-select-arrow" aria-hidden="true">▼</span>
			</button>

			<transition name="dropdown">
				<div
					v-if="isOpen"
					:id="listId"
					ref="dropdown"
					class="k-select-dropdown"
					role="listbox"
					:aria-multiselectable="multiple"
					:aria-labelledby="label ? selectId : undefined"
					tabindex="-1"
					@keydown="handleDropdownKeydown"
				>
					<!-- Search input -->
					<div v-if="searchable" class="k-select-search">
						<input
							ref="searchInput"
							v-model="searchQuery"
							type="text"
							class="k-select-search-input"
							placeholder="Search..."
							aria-label="Search options"
							@click.stop
						>
					</div>

					<!-- Options list -->
					<div class="k-select-options">
						<div
							v-for="(option, index) in filteredOptions"
							:key="getOptionValue(option)"
							class="k-select-option"
							:class="{
								'is-selected': isSelected(option),
								'is-focused': focusedIndex === index,
								'is-disabled': getOptionDisabled(option)
							}"
							:role="multiple ? 'checkbox' : 'option'"
							:aria-selected="isSelected(option)"
							:aria-disabled="getOptionDisabled(option)"
							:aria-checked="multiple ? isSelected(option) : undefined"
							@click="selectOption(option)"
							@mouseenter="focusedIndex = index"
						>
							<span v-if="multiple" class="k-select-checkbox" aria-hidden="true">
								{{ isSelected(option) ? '☑' : '☐' }}
							</span>
							<span class="k-select-option-label">{{ getOptionLabel(option) }}</span>
						</div>
						<div v-if="filteredOptions.length === 0" class="k-select-empty">
							{{ emptyText || 'No options available' }}
						</div>
					</div>
				</div>
			</transition>
		</div>
		<span v-if="error" :id="errorId" class="k-select-error" role="alert" aria-live="polite">{{ error }}</span>
		<span v-else-if="hint" :id="hintId" class="k-select-hint">{{ hint }}</span>
	</div>
</template>

<script>
export default {
	name: 'KSelect',
	props: {
		modelValue: {
			type: [String, Number, Array, Object],
			default: null
		},
		options: {
			type: Array,
			required: true
		},
		label: {
			type: String,
			default: ''
		},
		placeholder: {
			type: String,
			default: 'Select...'
		},
		multiple: {
			type: Boolean,
			default: false
		},
		searchable: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		required: {
			type: Boolean,
			default: false
		},
		clearable: {
			type: Boolean,
			default: false
		},
		optionLabel: {
			type: [String, Function],
			default: 'label'
		},
		optionValue: {
			type: [String, Function],
			default: 'value'
		},
		optionDisabled: {
			type: [String, Function],
			default: 'disabled'
		},
		error: {
			type: String,
			default: ''
		},
		hint: {
			type: String,
			default: ''
		},
		emptyText: {
			type: String,
			default: 'No options available'
		}
	},
	emits: ['update:modelValue', 'change', 'open', 'close'],
	data() {
		return {
			isOpen: false,
			searchQuery: '',
			focusedIndex: -1,
			uniqueId: Math.random().toString( 36 ).substring( 2, 9 )
		}
	},
	computed: {
		selectId() {
			return `k-select-${this.uniqueId}`
		},
		listId() {
			return `k-select-list-${this.uniqueId}`
		},
		errorId() {
			return `k-select-error-${this.uniqueId}`
		},
		hintId() {
			return `k-select-hint-${this.uniqueId}`
		},
		ariaDescribedBy() {
			const ids = []
			if ( this.error ) ids.push( this.errorId )
			else if ( this.hint ) ids.push( this.hintId )
			return ids.length ? ids.join( ' ' ) : undefined
		},
		hasValue() {
			if ( this.multiple ) {
				return Array.isArray( this.modelValue ) && this.modelValue.length > 0
			}
			return this.modelValue !== null && this.modelValue !== undefined && this.modelValue !== ''
		},
		displayValue() {
			if ( !this.hasValue ) return ''

			if ( this.multiple ) {
				const selected = this.modelValue.map( val => {
					const option = this.options.find( opt => this.getOptionValue( opt ) === val )
					return option ? this.getOptionLabel( option ) : val
				} )
				return selected.join( ', ' )
			} else {
				const option = this.options.find( opt => this.getOptionValue( opt ) === this.modelValue )
				return option ? this.getOptionLabel( option ) : this.modelValue
			}
		},
		filteredOptions() {
			if ( !this.searchQuery ) return this.options

			const query = this.searchQuery.toLowerCase()
			return this.options.filter( option => {
				const label = this.getOptionLabel( option ).toLowerCase()
				return label.includes( query )
			} )
		}
	},
	watch: {
		isOpen( newVal ) {
			if ( newVal ) {
				this.$emit( 'open' )
				this.$nextTick( () => {
					if ( this.searchable && this.$refs.searchInput ) {
						this.$refs.searchInput.focus()
					}
					this.scrollToSelected()
				} )
			} else {
				this.$emit( 'close' )
				this.searchQuery = ''
				this.focusedIndex = -1
			}
		}
	},
	mounted() {
		document.addEventListener( 'click', this.handleOutsideClick )
	},
	beforeUnmount() {
		document.removeEventListener( 'click', this.handleOutsideClick )
	},
	methods: {
		getOptionLabel( option ) {
			if ( typeof this.optionLabel === 'function' ) {
				return this.optionLabel( option )
			}
			return typeof option === 'object' ? option[this.optionLabel] : option
		},
		getOptionValue( option ) {
			if ( typeof this.optionValue === 'function' ) {
				return this.optionValue( option )
			}
			return typeof option === 'object' ? option[this.optionValue] : option
		},
		getOptionDisabled( option ) {
			if ( typeof this.optionDisabled === 'function' ) {
				return this.optionDisabled( option )
			}
			return typeof option === 'object' ? option[this.optionDisabled] : false
		},
		isSelected( option ) {
			const value = this.getOptionValue( option )
			if ( this.multiple ) {
				return Array.isArray( this.modelValue ) && this.modelValue.includes( value )
			}
			return this.modelValue === value
		},
		toggleDropdown() {
			if ( !this.disabled ) {
				this.isOpen = !this.isOpen
			}
		},
		selectOption( option ) {
			if ( this.getOptionDisabled( option ) ) return

			const value = this.getOptionValue( option )

			if ( this.multiple ) {
				const currentValue = Array.isArray( this.modelValue ) ? [...this.modelValue] : []
				const index = currentValue.indexOf( value )

				if ( index > -1 ) {
					currentValue.splice( index, 1 )
				} else {
					currentValue.push( value )
				}

				this.$emit( 'update:modelValue', currentValue )
				this.$emit( 'change', currentValue )
			} else {
				this.$emit( 'update:modelValue', value )
				this.$emit( 'change', value )
				this.isOpen = false
			}
		},
		handleOutsideClick( event ) {
			if ( !this.$el.contains( event.target ) ) {
				this.isOpen = false
			}
		},
		handleTriggerKeydown( event ) {
			switch ( event.key ) {
				case 'Enter':
				case ' ':
					event.preventDefault()
					this.toggleDropdown()
					break
				case 'ArrowDown':
					event.preventDefault()
					if ( !this.isOpen ) {
						this.isOpen = true
					} else {
						this.focusNext()
					}
					break
				case 'ArrowUp':
					event.preventDefault()
					if ( !this.isOpen ) {
						this.isOpen = true
					} else {
						this.focusPrevious()
					}
					break
				case 'Escape':
					this.isOpen = false
					break
			}
		},
		handleDropdownKeydown( event ) {
			switch ( event.key ) {
				case 'ArrowDown':
					event.preventDefault()
					this.focusNext()
					break
				case 'ArrowUp':
					event.preventDefault()
					this.focusPrevious()
					break
				case 'Enter':
				case ' ':
					event.preventDefault()
					if ( this.focusedIndex >= 0 && this.focusedIndex < this.filteredOptions.length ) {
						this.selectOption( this.filteredOptions[this.focusedIndex] )
					}
					break
				case 'Escape':
					this.isOpen = false
					this.$el.querySelector( '.k-select-trigger' ).focus()
					break
				case 'Tab':
					this.isOpen = false
					break
			}
		},
		focusNext() {
			if ( this.focusedIndex < this.filteredOptions.length - 1 ) {
				this.focusedIndex++
			} else {
				this.focusedIndex = 0
			}
			this.scrollToFocused()
		},
		focusPrevious() {
			if ( this.focusedIndex > 0 ) {
				this.focusedIndex--
			} else {
				this.focusedIndex = this.filteredOptions.length - 1
			}
			this.scrollToFocused()
		},
		scrollToFocused() {
			this.$nextTick( () => {
				const dropdown = this.$refs.dropdown
				if ( !dropdown ) return

				const focusedEl = dropdown.querySelector( '.k-select-option.is-focused' )
				if ( focusedEl ) {
					focusedEl.scrollIntoView( { block: 'nearest' } )
				}
			} )
		},
		scrollToSelected() {
			this.$nextTick( () => {
				const dropdown = this.$refs.dropdown
				if ( !dropdown ) return

				const selectedEl = dropdown.querySelector( '.k-select-option.is-selected' )
				if ( selectedEl ) {
					selectedEl.scrollIntoView( { block: 'nearest' } )
				}
			} )
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.k-select-wrapper
	margin-bottom 1.2rem

.k-select-label
	display block
	margin-bottom 0.5rem
	color #666
	font-weight 500
	font-size 0.9rem

	.required
		color #F44336
		margin-left 0.25rem

.k-select-container
	position relative
	width 100%

.k-select-trigger
	width 100%
	padding 0.75rem
	background white
	border 1px solid #ddd
	border-radius 8px
	display flex
	align-items center
	justify-content space-between
	cursor pointer
	font-size 1rem
	font-family inherit
	transition all 0.2s
	text-align left

	&:hover:not(.is-disabled)
		border-color $color-primary

	&:focus
		outline none
		border-color $color-primary
		box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

	&.is-open
		border-color $color-primary
		box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

		.k-select-arrow
			transform rotate(180deg)

	&.is-disabled
		background #f5f5f5
		cursor not-allowed
		opacity 0.7

	&.has-error
		border-color #F44336

.k-select-value
	flex 1
	overflow hidden
	text-overflow ellipsis
	white-space nowrap
	color #333

	&:empty
		color #999

.k-select-arrow
	margin-left 0.5rem
	color #666
	transition transform 0.2s

.k-select-dropdown
	position absolute
	top 100%
	left 0
	right 0
	margin-top 4px
	background white
	border 1px solid #ddd
	border-radius 8px
	box-shadow 0 4px 12px rgba(0, 0, 0, 0.15)
	z-index 1000
	max-height 300px
	overflow hidden
	display flex
	flex-direction column

.k-select-search
	padding 0.5rem
	border-bottom 1px solid #e0e0e0

.k-select-search-input
	width 100%
	padding 0.5rem
	border 1px solid #ddd
	border-radius 6px
	font-size 0.95rem

	&:focus
		outline none
		border-color $color-primary

.k-select-options
	flex 1
	overflow-y auto
	padding 0.5rem

.k-select-option
	padding 0.75rem
	cursor pointer
	border-radius 6px
	transition all 0.2s
	display flex
	align-items center
	gap 0.5rem

	&:hover:not(.is-disabled)
		background $color-bg-tertiary

	&.is-focused
		background $color-bg-tertiary
		outline 2px solid $color-primary

	&.is-selected
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		font-weight 500

	&.is-disabled
		opacity 0.5
		cursor not-allowed

.k-select-checkbox
	font-size 1.2rem

.k-select-option-label
	flex 1

.k-select-empty
	padding 1rem
	text-align center
	color #999

.k-select-error
	display block
	margin-top 0.25rem
	color #F44336
	font-size 0.85rem

.k-select-hint
	display block
	margin-top 0.25rem
	color #999
	font-size 0.85rem

// Dropdown animation
.dropdown-enter-active, .dropdown-leave-active
	transition all 0.2s ease

.dropdown-enter-from, .dropdown-leave-to
	opacity 0
	transform translateY(-10px)
</style>