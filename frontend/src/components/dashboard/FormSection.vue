<template>
	<div class="form-section">
		<div v-if="title || description" class="form-header">
			<h3 v-if="title">{{ title }}</h3>
			<p v-if="description" class="form-description">{{ description }}</p>
		</div>

		<form @submit.prevent="$emit('submit')">
			<div class="form-body">
				<slot></slot>
			</div>

			<div v-if="showActions" class="form-actions">
				<slot name="actions">
					<KButton
						v-if="showCancel"
						variant="secondary"
						@click="$emit('cancel')"
					>
						{{ cancelText }}
					</KButton>
					<KButton
						type="submit"
						:loading="loading"
						:disabled="disabled"
					>
						{{ submitText }}
					</KButton>
				</slot>
			</div>
		</form>
	</div>
</template>

<script>
export default {
	name: 'FormSection',
	props: {
		title: {
			type: String,
			default: ''
		},
		description: {
			type: String,
			default: ''
		},
		submitText: {
			type: String,
			default: 'Save'
		},
		cancelText: {
			type: String,
			default: 'Cancel'
		},
		showActions: {
			type: Boolean,
			default: true
		},
		showCancel: {
			type: Boolean,
			default: false
		},
		loading: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ['submit', 'cancel']
}
</script>

<style lang="stylus" scoped>
.form-section
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0,0,0,0.05)

.form-header
	margin-bottom 1.5rem
	padding-bottom 1rem
	border-bottom 1px solid #f0f0f0

	h3
		margin 0 0 0.5rem 0
		font-size 1.25rem
		color #333

.form-description
	margin 0
	color #666
	font-size 0.9rem
	line-height 1.5

.form-body
	margin-bottom 1.5rem

.form-actions
	display flex
	gap 1rem
	justify-content flex-end
	padding-top 1rem
	border-top 1px solid #f0f0f0
</style>