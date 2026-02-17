<template>
	<section class="mansion-residents-section">
		<SectionHeader
			:title="$t('mansion.residents.title') || 'Residents'"
			icon="👥"
		>
			<template #actions>
				<KButton variant="primary" icon="➕" @click="$emit('add')">
					{{ $t('mansion.residents.invite') || 'Invite Resident' }}
				</KButton>
			</template>
		</SectionHeader>

		<!-- Search Bar -->
		<div class="residents-filter-bar">
			<div class="filter-search">
				<input
					type="search"
					class="search-input"
					:value="search"
					:placeholder="$t('mansion.residents.searchPlaceholder') || 'Search residents by name or email...'"
					@input="$emit('search', $event.target.value)"
				>
			</div>
		</div>

		<!-- Results Count -->
		<div v-if="pagination.total > 0" class="residents-results-info">
			<span class="results-count">
				{{ $t('mansion.residents.showingResults', { start: resultsStart, end: resultsEnd, total: pagination.total }) || `Showing ${resultsStart}-${resultsEnd} of ${pagination.total} residents` }}
			</span>
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="loading-state">
			<p>{{ $t('common.loading') || 'Loading...' }}</p>
		</div>

		<!-- Empty State -->
		<div v-else-if="residents.length === 0" class="empty-state">
			<p v-if="search">{{ $t('mansion.residents.noResults') || 'No residents matching your search.' }}</p>
			<p v-else>{{ $t('mansion.residents.empty') || 'No residents yet.' }}</p>
			<KButton v-if="!search" variant="primary" @click="$emit('add')">
				{{ $t('mansion.residents.invite') || 'Invite First Resident' }}
			</KButton>
		</div>

		<!-- Residents Table -->
		<div v-else class="residents-table-card">
			<div class="residents-table">
				<table>
					<thead>
						<tr>
							<th class="sortable-header" @click="$emit('sort', 'name')">
								{{ $t('admin.users.name') || 'Name' }}
								<span v-if="sort === 'name' || sort === '-name'" class="sort-indicator">
									{{ sort === 'name' ? '▲' : '▼' }}
								</span>
							</th>
							<th class="sortable-header" @click="$emit('sort', 'email')">
								{{ $t('admin.users.email') || 'Email' }}
								<span v-if="sort === 'email' || sort === '-email'" class="sort-indicator">
									{{ sort === 'email' ? '▲' : '▼' }}
								</span>
							</th>
							<th>{{ $t('mansion.residents.unit') || 'Unit' }}</th>
							<th>{{ $t('mansion.residents.phone') || 'Phone' }}</th>
							<th>{{ $t('admin.users.actions') || 'Actions' }}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="r in residents" :key="r.id">
							<td>{{ r.name || '-' }}</td>
							<td>{{ r.email }}</td>
							<td>{{ r.unit || '-' }}</td>
							<td>{{ r.phone || '-' }}</td>
							<td class="actions-cell">
								<button class="action-btn" @click="$emit('edit', r)">
									✏️ {{ $t('common.edit') || 'Edit' }}
								</button>
								<button class="action-btn action-btn--danger" @click="$emit('delete', r)">
									🗑️ {{ $t('common.delete') || 'Delete' }}
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			<div v-if="pagination.totalPages > 1" class="pagination">
				<KButton
					size="sm"
					variant="secondary"
					:disabled="pagination.page === 1"
					@click="$emit('page-change', pagination.page - 1)"
				>
					{{ $t('common.previous') || 'Previous' }}
				</KButton>

				<span class="pagination-info">
					{{ $t('common.pageOf', { current: pagination.page, total: pagination.totalPages }) || `Page ${pagination.page} of ${pagination.totalPages}` }}
				</span>

				<KButton
					size="sm"
					variant="secondary"
					:disabled="pagination.page >= pagination.totalPages"
					@click="$emit('page-change', pagination.page + 1)"
				>
					{{ $t('common.next') || 'Next' }}
				</KButton>
			</div>
		</div>
	</section>
</template>
<script>
export default {
	name: 'MansionResidentsSection',
	props: {
		residents: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: false
		},
		pagination: {
			type: Object,
			default: () => ( { page: 1, total: 0, totalPages: 0 } )
		},
		sort: {
			type: String,
			default: '-createdAt'
		},
		search: {
			type: String,
			default: ''
		}
	},
	emits: ['add', 'edit', 'delete', 'search', 'sort', 'page-change'],
	computed: {
		resultsStart() {
			return ( ( this.pagination.page - 1 ) * ( this.pagination.limit || 25 ) ) + 1
		},
		resultsEnd() {
			return Math.min( this.pagination.page * ( this.pagination.limit || 25 ), this.pagination.total )
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/tokens.styl'

.mansion-residents-section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

.loading-state, .empty-state
	text-align center
	padding 3rem
	color #666
	p
		margin-bottom 1rem

// Filter bar
.residents-filter-bar
	display flex
	align-items center
	gap 1rem
	margin-bottom 1.5rem
	padding 1rem 1.5rem
	background $color-bg-tertiary
	border-radius $radius-lg

.filter-search
	flex 1
	min-width 250px

	.search-input
		width 100%
		padding 0.75rem 1rem 0.75rem 2.5rem
		border 1px solid $color-border
		border-radius $radius-pill
		font-size 0.95rem
		background-image url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")
		background-repeat no-repeat
		background-position 0.75rem center
		transition border-color 0.2s

		&:focus
			outline none
			border-color $color-primary
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.15)

		&::placeholder
			color $color-text-tertiary

// Results info
.residents-results-info
	margin-bottom 1rem

	.results-count
		font-size 0.9rem
		color $color-text-secondary

// Table card
.residents-table-card
	background white
	border-radius 12px
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)
	overflow hidden

// Table
.residents-table
	overflow-x auto

	table
		width 100%
		border-collapse collapse

		th
			background $color-bg-tertiary
			padding 1rem
			text-align left
			color #333
			font-weight 600
			border-bottom 2px solid $color-primary

		td
			padding 1rem
			border-bottom 1px solid #f0f0f0

		tbody tr:hover
			background #f9f9f9

// Sortable headers
.sortable-header
	cursor pointer
	user-select none
	transition background 0.2s

	&:hover
		background rgba(255, 193, 7, 0.1)

	.sort-indicator
		margin-left 0.5rem
		font-size 0.75rem
		color $color-primary

// Pagination
.pagination
	display flex
	justify-content center
	align-items center
	gap 1rem
	padding 1rem
	border-top 1px solid $color-border

	.pagination-info
		font-size 0.9rem
		color $color-text-secondary

// Actions
.actions-cell
	display flex
	gap 0.25rem
	flex-wrap wrap

.action-btn
	padding 0.35rem 0.6rem
	font-size 0.8rem
	border none
	border-radius 6px
	background transparent
	color #666
	cursor pointer
	transition all 0.2s
	white-space nowrap

	&:hover
		background #f0f0f0
		color #333

	&--danger:hover
		background #ffebee
		color #d32f2f
</style>
