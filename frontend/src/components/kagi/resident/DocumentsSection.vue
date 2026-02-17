<template>
	<section class="section">
		<!-- Document List -->
		<div v-if="!selectedDocument">
			<div class="section-header">
				<h2 class="section-title">
					<Icon name="document" :size="30" color="#FFC107" />
					{{ $t('dashboard.menu.documents') }}
				</h2>
			</div>

			<!-- Loading State -->
			<div v-if="loading" class="loading-state">
				<p>{{ $t('common.loading') }}</p>
			</div>

			<!-- Empty State -->
			<div v-else-if="documents.length === 0" class="empty-state">
				<p>{{ $t('mansion.documents.empty') }}</p>
			</div>

			<!-- Documents Grid -->
			<div v-else class="documents-grid">
				<div
					v-for="doc in documents"
					:key="doc.id"
					class="document-card"
					@click="viewDocument(doc)"
				>
					<div class="document-icon">{{ getCategoryIcon(doc.category) }}</div>
					<div class="document-content">
						<h3>{{ doc.title }}</h3>
						<p class="document-updated">{{ $t('dashboard.documents.lastUpdated') }}: {{ formatDate(doc.updatedAt) }}</p>
					</div>
					<div class="document-action">
						<span class="view-btn">{{ $t('dashboard.documents.view') }} →</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Document Viewer -->
		<div v-else class="document-viewer-wrapper">
			<DocumentViewer
				:title="selectedDocument.title"
				:content="selectedDocument.content"
				:last-updated="formatDate(selectedDocument.updatedAt)"
				:document-id="selectedDocument.id"
				@close="selectedDocument = null"
			/>
		</div>
	</section>
</template>

<script>
import backend from '../../../services/SupabaseBackend'

export default {
	name: 'DocumentsSection',
	data() {
		return {
			selectedDocument: null,
<<<<<<< HEAD
			// Mock documents data - in the future this will come from API
			mockDocuments: [
				{
					id: 'management',
					icon: '📋',
					title: this.$t( 'dashboard.documents.managementRules' ),
					lastUpdated: '2024/01',
					content: `# Building Management Rules

## General Rules

1. **Quiet Hours**: 10:00 PM - 7:00 AM
   - Please keep noise to a minimum during these hours
   - No construction or renovation work allowed

2. **Common Areas**
   - Keep common areas clean and tidy
   - Report any damage or maintenance issues immediately
   - No storage of personal items in hallways

3. **Pets**
   - All pets must be registered with management
   - Dogs must be on a leash in common areas
   - Owners are responsible for cleaning up after pets

## Security

- Do not prop open entrance doors
- Report suspicious activity to management
- Ensure all guests are registered at reception

## Waste Management

- Separate recyclables from general waste
- Dispose of large items by arrangement with management
- Use designated waste disposal times

For questions, please contact building management.`
				},
				{
					id: 'facility',
					icon: '🏢',
					title: this.$t( 'dashboard.documents.facilityRules' ),
					lastUpdated: '2024/03',
					content: `# Facility Usage Rules

## Party Room

- Maximum capacity: 30 people
- Booking required 48 hours in advance
- Clean and return furniture to original positions
- No smoking or vaping
- Security deposit may be required

## Guest Room

- Maximum 2 guests per night
- Check-in after 3:00 PM
- Check-out before 11:00 AM
- Residents are responsible for guest behavior
- Report any damages immediately

## Fitness Gym

- Operating hours: 6:00 AM - 10:00 PM
- Age restriction: 16 years and above
- Wipe down equipment after use
- Return weights to proper storage
- Appropriate footwear required

## Rooftop Garden

- Respect plants and garden equipment
- No BBQ without prior permission
- Clean up after use
- Children must be supervised

## General

- Reservations can be cancelled up to 24 hours before
- Failure to show up may result in booking restrictions
- Be considerate of other residents

Contact management for bookings and inquiries.`
				},
				{
					id: 'parking',
					icon: '🚗',
					title: this.$t( 'dashboard.documents.parkingRules' ),
					lastUpdated: '2023/12',
					content: `# Parking Rules & Regulations

## Assigned Parking

- Each unit is allocated specific parking space(s)
- Parking space numbers must match unit registration
- Unauthorized vehicles will be towed at owner's expense

## Visitor Parking

- Limited to 2 hours for short-term visitors
- Register at reception for extended stays
- Overnight parking requires prior approval
- Maximum 3 consecutive nights

## General Rules

1. **Speed Limit**: 10 km/h maximum
2. **No Parking Zones**:
   - Fire lanes
   - Loading zones
   - Handicapped spaces (without permit)

3. **Vehicle Maintenance**:
   - No major repairs in parking area
   - No washing vehicles in parking garage
   - Oil leaks must be cleaned immediately

4. **Motorcycles & Bicycles**:
   - Use designated areas only
   - Secure with proper locks
   - No blocking walkways

## Electric Vehicle Charging

- Use designated EV charging stations
- Maximum 4 hours during peak times
- Report malfunctioning chargers to management

## Violations

First offense: Warning
Second offense: Fine (¥10,000)
Third offense: Parking privileges revoked

For parking permits or questions, contact management office.`
				},
				{
					id: 'minutes',
					icon: '📝',
					title: this.$t( 'dashboard.documents.residentMinutes' ),
					lastUpdated: '2024/02',
					content: `# Residents Assembly Minutes (Feb 2024)

## Agenda Items

1. **FY2023 Financial Report**
   - Approved by majority vote.

2. **FY2024 Budget Plan**
   - Approved without amendments.

3. **Upcoming Major Repairs**
   - Scheduled for Spring 2025.
   - Contractor selection in progress.

4. **Board Member Election**
   - New board members have been elected.

## Other Business

- Discussion on improved waste disposal procedures.
- Bicycle parking organization usage reminders.

Next general assembly is scheduled for January 2025.`
				},
				{
					id: 'notices',
					icon: '📢',
					title: this.$t( 'dashboard.documents.notices' ),
					lastUpdated: '2024/03',
					content: `# Information from the Building

## Elevator Maintenance
- **Date**: March 15, 10:00 - 12:00
- **Details**: Elevators will be out of service for regular maintenance. Please use stairs.

## Drain Cleaning Schedule
- **Date**: April 1 - April 3
- Please check the bulletin board for your unit's specific time slot.

## Pet Policy Update
- Pets must be carried in common areas (except large dogs).
- Please ensure you clean up after your pets immediately.

## Recycling Reminder
- Please separate PET bottles and caps.
- Cardboard boxes must be flattened.

Thank you for your cooperation.`
				}
			]
=======
			documents: [],
			loading: true
>>>>>>> 02c21bf03633087a0ec7e5a96aef6f524153b7e9
		}
	},
	async mounted() {
		await this.fetchDocuments()
	},
	methods: {
		async fetchDocuments() {
			this.loading = true
			try {
				const response = await backend.query( 'documents', { status: 'published', sort: '-updatedAt' } )
				if ( response.success ) {
					this.documents = response.data
				}
			} catch ( error ) {
				console.error( 'Failed to fetch documents:', error )
			} finally {
				this.loading = false
			}
		},

		viewDocument( doc ) {
			this.selectedDocument = doc
			this.recordRead( doc.id )
		},

		async recordRead( documentId ) {
			try {
				await backend.create( 'document_reads', { documentId } )
			} catch {
				// Silently fail - read tracking is non-critical
			}
		},

		getCategoryIcon( category ) {
			const icons = {
				rules: '📋',
				safety: '🛡️',
				financial: '💰',
				minutes: '📝',
				general: '📄'
			}
			return icons[category] || '📄'
		},

		formatDate( dateStr ) {
			if ( !dateStr ) return ''
			const d = new Date( dateStr )
			return `${d.getFullYear()}/${String( d.getMonth() + 1 ).padStart( 2, '0' )}`
		}
	}
}
</script>

<style lang="stylus" scoped>
.section
	padding 0

.section-header
	padding 2rem 2rem 2rem 2rem

.section-title
	margin 0
	font-size 1.75rem
	font-weight 600
	color #333
	display flex
	align-items center
	gap 0.5rem
	justify-content center


.documents-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(320px, 1fr))
	gap 1.5rem
	padding 0 2rem 3rem 2rem

@media (max-width: 768px)
	.section-header
		padding 1rem 1rem 1rem 1rem
		margin-bottom 1rem

	.documents-grid
		padding 0 1rem 2rem 1rem

.document-card
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0,0,0,0.08)
	transition all 0.3s ease
	cursor pointer
	display flex
	align-items center
	gap 1rem

	&:hover
		transform translateY(-2px)
		box-shadow 0 4px 16px rgba(0,0,0,0.15)

.document-icon
	font-size 2.5rem
	min-width 60px
	height 60px
	display flex
	align-items center
	justify-content center
	background linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)
	border-radius 10px

.document-content
	flex 1

	h3
		margin 0 0 0.5rem 0
		font-size 1.1rem
		color #333
		font-weight 600

.document-updated
	margin 0
	color #888
	font-size 0.9rem

.document-action
	.view-btn
		color #FFB300
		font-weight 500
		font-size 0.95rem
		white-space nowrap

@media (max-width: 768px)
	.documents-grid
		grid-template-columns 1fr

	.document-action
		display none

.document-viewer-wrapper
	position relative
	min-height 600px
	padding 0

.loading-state
	text-align center
	padding 3rem
	color #888

.empty-state
	text-align center
	padding 3rem
	color #888
</style>
