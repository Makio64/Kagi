<template>
	<div class="k-table-wrapper" :class="{ 'no-padding': noPadding }">
		<div v-if="searchable || $slots.actions" class="table-toolbar">
			<div v-if="searchable" class="table-search">
				<input
					v-model="searchQuery"
					type="text"
					:placeholder="searchPlaceholder"
					class="search-input"
				>
			</div>
			<div v-if="$slots.actions" class="table-actions">
				<slot name="actions" />
			</div>
		</div>

		<div class="table-container" role="region" :aria-label="tableLabel || 'Data table'" :aria-busy="loading">
			<div v-if="loading" class="table-loading-overlay">
				<div class="table-loading-spinner" aria-hidden="true"></div>
				<span class="table-loading-text">{{ loadingText }}</span>
			</div>
			<table role="table" :aria-rowcount="data.length" :aria-colcount="columns.length">
				<thead role="rowgroup">
					<tr role="row">
						<th
							v-for="column in columns"
							:key="column.key"
							role="columnheader"
							scope="col"
							:style="{ width: column.width }"
							:class="{ sortable: column.sortable, sorted: sortKey === column.key }"
							:aria-sort="getAriaSort(column)"
							:tabindex="column.sortable ? 0 : -1"
							@click="column.sortable ? handleSort( column.key ) : null"
							@keydown.enter.space.prevent="column.sortable ? handleSort( column.key ) : null"
						>
							{{ column.label }}
							<span v-if="column.sortable" class="sort-icon" aria-hidden="true">
								{{ sortKey === column.key ? ( sortOrder === 'asc' ? '↑' : '↓' ) : '↕' }}
							</span>
						</th>
					</tr>
				</thead>
				<tbody role="rowgroup">
					<tr v-if="loading" role="row">
						<td :colspan="columns.length" class="loading-rows" role="cell">
							<div v-for="n in 3" :key="n" class="skeleton-row">
								<div v-for="column in columns" :key="column.key" class="skeleton-cell"></div>
							</div>
						</td>
					</tr>
					<template v-else>
						<tr
							v-for="(row, index) in filteredData"
							:key="row.id || index"
							role="row"
							:aria-rowindex="index + 2"
							:class="{ clickable: clickableRows }"
							:tabindex="clickableRows ? 0 : -1"
							@click="$emit( 'row-click', row )"
							@keydown.enter.space.prevent="clickableRows ? $emit( 'row-click', row ) : null"
						>
							<td v-for="column in columns" :key="column.key" role="cell">
								<slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
									{{ formatCell( row[column.key], column.format ) }}
								</slot>
							</td>
						</tr>
						<tr v-if="filteredData.length === 0" role="row">
							<td :colspan="columns.length" class="empty-state" role="cell">
								{{ emptyMessage }}
							</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>

		<div v-if="showPagination && totalPages > 1" class="table-pagination">
			<button
				:disabled="currentPage === 1"
				class="page-btn"
				@click="currentPage--"
			>
				Previous
			</button>
			<span class="page-info">
				Page {{ currentPage }} of {{ totalPages }}
			</span>
			<button
				:disabled="currentPage === totalPages"
				class="page-btn"
				@click="currentPage++"
			>
				Next
			</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'KTable',
	props: {
		columns: {
			type: Array,
			required: true
		},
		data: {
			type: Array,
			required: true
		},
		loading: {
			type: Boolean,
			default: false
		},
		loadingText: {
			type: String,
			default: 'Loading...'
		},
		searchable: {
			type: Boolean,
			default: false
		},
		searchPlaceholder: {
			type: String,
			default: 'Search...'
		},
		emptyMessage: {
			type: String,
			default: 'No data available'
		},
		noPadding: {
			type: Boolean,
			default: false
		},
		clickableRows: {
			type: Boolean,
			default: false
		},
		pageSize: {
			type: Number,
			default: 10
		},
		showPagination: {
			type: Boolean,
			default: false
		},
		tableLabel: {
			type: String,
			default: ''
		}
	},
	emits: ['row-click'],
	data() {
		return {
			searchQuery: '',
			sortKey: null,
			sortOrder: 'asc',
			currentPage: 1
		}
	},
	computed: {
		filteredData() {
			let result = [...this.data]

			// Apply search filter
			if ( this.searchQuery ) {
				result = result.filter( row => {
					return Object.values( row ).some( value =>
						String( value ).toLowerCase().includes( this.searchQuery.toLowerCase() )
					)
				} )
			}

			// Apply sorting
			if ( this.sortKey ) {
				result.sort( ( a, b ) => {
					const aVal = a[this.sortKey]
					const bVal = b[this.sortKey]

					if ( aVal < bVal ) return this.sortOrder === 'asc' ? -1 : 1
					if ( aVal > bVal ) return this.sortOrder === 'asc' ? 1 : -1
					return 0
				} )
			}

			// Apply pagination
			if ( this.showPagination ) {
				const start = ( this.currentPage - 1 ) * this.pageSize
				const end = start + this.pageSize
				result = result.slice( start, end )
			}

			return result
		},
		totalPages() {
			if ( !this.showPagination ) return 1
			return Math.ceil( this.data.length / this.pageSize )
		}
	},
	methods: {
		handleSort( key ) {
			if ( this.sortKey === key ) {
				this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
			} else {
				this.sortKey = key
				this.sortOrder = 'asc'
			}
		},
		formatCell( value, format ) {
			if ( !format ) return value

			switch ( format ) {
				case 'currency':
					return new Intl.NumberFormat( 'ja-JP', {
						style: 'currency',
						currency: 'JPY'
					} ).format( value )
				case 'date':
					return new Date( value ).toLocaleDateString()
				case 'boolean':
					return value ? '✓' : '✗'
				default:
					return value
			}
		},
		getAriaSort( column ) {
			if ( !column.sortable ) return undefined
			if ( this.sortKey !== column.key ) return 'none'
			return this.sortOrder === 'asc' ? 'ascending' : 'descending'
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.k-table-wrapper
	background white
	border-radius 12px
	overflow hidden

	&.no-padding
		.table-container
			padding 0

.table-toolbar
	display flex
	justify-content space-between
	align-items center
	padding 1rem
	border-bottom 1px solid #e0e0e0

	.table-search
		flex 1
		max-width 300px

		.search-input
			width 100%
			padding 0.5rem 1rem
			border 1px solid #ddd
			border-radius 8px
			font-size 0.95rem

			&:focus
				outline none
				border-color $color-primary
				box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

	.table-actions
		display flex
		gap 0.5rem

.table-container
	overflow-x auto
	padding 1rem

	@media (max-width: 768px)
		padding 0.5rem

table
	width 100%
	border-collapse collapse

	thead
		background $color-bg-tertiary

		th
			padding 1rem
			text-align left
			color #333
			font-weight 600
			border-bottom 2px solid $color-primary
			white-space nowrap
			user-select none

			&.sortable
				cursor pointer
				transition background-color 0.2s

				&:hover
					background rgba(255, 193, 7, 0.1)

			&.sorted
				background rgba(255, 193, 7, 0.05)

			.sort-icon
				margin-left 0.5rem
				color $color-primary
				font-size 0.9em

	tbody
		tr
			transition background-color 0.2s

			&:hover
				background #f9f9f9

			&.clickable
				cursor pointer

		td
			padding 1rem
			border-bottom 1px solid #f0f0f0
			color #666

			&.empty-state
				text-align center
				padding 2rem
				color #999

.table-pagination
	display flex
	justify-content center
	align-items center
	gap 1rem
	padding 1rem
	border-top 1px solid #e0e0e0

	.page-btn
		padding 0.5rem 1rem
		border 1px solid #ddd
		background white
		border-radius 8px
		cursor pointer
		transition all 0.2s

		&:hover:not(:disabled)
			background $color-bg-tertiary
			border-color $color-primary

		&:disabled
			opacity 0.5
			cursor not-allowed

	.page-info
		color #666
		font-size 0.95rem

// Loading styles
.table-loading-overlay
	position absolute
	top 50%
	left 50%
	transform translate(-50%, -50%)
	display flex
	flex-direction column
	align-items center
	gap 1rem
	z-index 10

.table-loading-spinner
	width 40px
	height 40px
	border 4px solid #f0f0f0
	border-top-color $color-primary
	border-radius 50%
	animation spin 1s linear infinite

@keyframes spin
	from
		transform rotate(0deg)
	to
		transform rotate(360deg)

.table-loading-text
	color #666
	font-size 0.95rem

.loading-rows
	padding 0

.skeleton-row
	display flex
	gap 1rem
	padding 1rem

.skeleton-cell
	height 20px
	background linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)
	background-size 200% 100%
	animation loading 1.5s ease-in-out infinite
	border-radius 4px
	flex 1

@keyframes loading
	0%
		background-position 200% 0
	100%
		background-position -200% 0

table
	position relative

	&[aria-busy="true"]
		opacity 0.5
		pointer-events none
</style>