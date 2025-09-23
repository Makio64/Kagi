<template>
	<div class="k-data-table">
		<div v-if="title || $slots.header" class="table-header">
			<h3 v-if="title">{{ title }}</h3>
			<slot name="header"></slot>
		</div>

		<div class="table-wrapper">
			<table>
				<thead v-if="columns.length">
					<tr>
						<th v-for="col in columns" :key="col.key" :style="{ width: col.width }">
							{{ col.label }}
						</th>
						<th v-if="$slots.actions" class="actions-column">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="!data.length">
						<td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="empty-state">
							{{ emptyText }}
						</td>
					</tr>
					<tr v-for="(row, index) in data" :key="row.id || index">
						<td v-for="col in columns" :key="col.key">
							<slot :name="`cell-${col.key}`" :row="row" :value="getNestedValue(row, col.key)">
								<StatusBadge v-if="col.type === 'status'" :status="getNestedValue(row, col.key)" />
								<span v-else>{{ formatValue(getNestedValue(row, col.key), col.type) }}</span>
							</slot>
						</td>
						<td v-if="$slots.actions" class="actions-cell">
							<slot name="actions" :row="row" :index="index"></slot>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div v-if="$slots.footer" class="table-footer">
			<slot name="footer"></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: 'KDataTable',
	props: {
		title: {
			type: String,
			default: ''
		},
		columns: {
			type: Array,
			required: true,
			validator: cols => cols.every(col => col.key && col.label)
		},
		data: {
			type: Array,
			required: true
		},
		emptyText: {
			type: String,
			default: 'No data available'
		}
	},
	methods: {
		getNestedValue(obj, path) {
			return path.split('.').reduce((acc, part) => acc && acc[part], obj)
		},
		formatValue(value, type) {
			if (value === null || value === undefined) return '-'

			switch(type) {
				case 'date':
					return new Date(value).toLocaleDateString()
				case 'datetime':
					return new Date(value).toLocaleString()
				case 'currency':
					return '¥' + value.toLocaleString()
				case 'percent':
					return value + '%'
				default:
					return value
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
.k-data-table
	background white
	border-radius 12px
	overflow hidden
	box-shadow 0 2px 8px rgba(0,0,0,0.05)

.table-header
	padding 1rem 1.5rem
	border-bottom 1px solid #f0f0f0

	h3
		margin 0
		font-size 1.1rem
		color #333

.table-wrapper
	overflow-x auto

table
	width 100%
	border-collapse collapse

thead
	background #f9f9f9

th
	text-align left
	padding 0.75rem 1rem
	font-weight 600
	font-size 0.85rem
	color #666
	border-bottom 2px solid #f0f0f0
	white-space nowrap

td
	padding 0.75rem 1rem
	border-bottom 1px solid #f5f5f5
	font-size 0.9rem
	color #333

tr:hover
	background #fafafa

.actions-column
	width 100px
	text-align center

.actions-cell
	text-align center

.empty-state
	text-align center
	padding 2rem
	color #999

.table-footer
	padding 1rem 1.5rem
	border-top 1px solid #f0f0f0
	background #f9f9f9
</style>