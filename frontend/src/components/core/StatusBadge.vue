<template>
	<span :class="['status-badge', variant, { small }]">
		<slot>{{ text }}</slot>
	</span>
</template>

<script>
export default {
	name: 'StatusBadge',
	props: {
		status: {
			type: String,
			default: ''
		},
		text: {
			type: String,
			default: ''
		},
		variant: {
			type: String,
			default: '',
			validator: v => ['', 'success', 'warning', 'danger', 'info', 'primary', 'secondary'].includes(v)
		},
		small: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		computedVariant() {
			if (this.variant) return this.variant

			// Auto-detect variant based on status text
			const statusLower = (this.status || this.text || '').toLowerCase()

			if (['active', 'paid', 'completed', 'success', 'approved', 'available'].includes(statusLower)) {
				return 'success'
			}
			if (['pending', 'in-progress', 'processing', 'assigned'].includes(statusLower)) {
				return 'warning'
			}
			if (['urgent', 'overdue', 'failed', 'rejected', 'expired', 'error'].includes(statusLower)) {
				return 'danger'
			}
			if (['high', 'important'].includes(statusLower)) {
				return 'primary'
			}
			if (['draft', 'inactive', 'disabled'].includes(statusLower)) {
				return 'secondary'
			}

			return 'info'
		}
	}
}
</script>

<style lang="stylus" scoped>
.status-badge
	display inline-block
	padding 0.25rem 0.75rem
	border-radius 50px
	font-size 0.85rem
	font-weight 600
	text-transform capitalize
	transition all 0.3s ease

	&.small
		padding 0.15rem 0.5rem
		font-size 0.75rem

	// Default
	background #f0f0f0
	color #666

	&.success
		background #E8F5E9
		color #2E7D32

	&.warning
		background #FFF3E0
		color #F57C00

	&.danger
		background #FFEBEE
		color #C62828

	&.info
		background #E3F2FD
		color #1976D2

	&.primary
		background #FFF8E1
		color #F57F17

	&.secondary
		background #FAFAFA
		color #757575
</style>