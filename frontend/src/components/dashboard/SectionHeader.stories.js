import KButton from '../core/KButton.vue'
import SectionHeader from './SectionHeader.vue'

export default {
	title: 'Dashboard/SectionHeader',
	component: SectionHeader,
	tags: ['autodocs'],
	argTypes: {
		title: {
			control: 'text',
			description: 'Section title'
		},
		subtitle: {
			control: 'text',
			description: 'Optional subtitle'
		},
		icon: {
			control: 'text',
			description: 'Optional icon emoji'
		},
		searchable: {
			control: 'boolean',
			description: 'Show search input'
		},
		searchPlaceholder: {
			control: 'text',
			description: 'Search input placeholder'
		}
	}
}

// Default header
export const Default = {
	args: {
		title: 'Buildings Management',
		icon: '🏢'
	}
}

// With subtitle
export const WithSubtitle = {
	args: {
		title: 'Residents Overview',
		subtitle: 'Manage and view all resident information',
		icon: '👥'
	}
}

// With search
export const WithSearch = {
	args: {
		title: 'Maintenance Requests',
		icon: '🔧',
		searchable: true,
		searchPlaceholder: 'Search requests...'
	}
}

// With actions
export const WithActions = {
	render: () => ( {
		components: { SectionHeader, KButton },
		template: `
			<SectionHeader 
				title="Buildings" 
				icon="🏢"
			>
				<template #actions>
					<KButton size="sm" variant="secondary">Export</KButton>
					<KButton size="sm" variant="primary" icon="➕">Add Building</KButton>
				</template>
			</SectionHeader>
		`
	} )
}

// With search and actions
export const WithSearchAndActions = {
	render: () => ( {
		components: { SectionHeader, KButton },
		template: `
			<SectionHeader 
				title="Residents" 
				subtitle="Total: 1,248 residents across 12 buildings"
				icon="👥"
				searchable
				searchPlaceholder="Search by name or unit..."
			>
				<template #actions>
					<KButton size="sm" variant="ghost">Filter</KButton>
					<KButton size="sm" variant="secondary">Export CSV</KButton>
					<KButton size="sm" variant="primary" icon="➕">Add Resident</KButton>
				</template>
			</SectionHeader>
		`
	} )
}

// With badge
export const WithBadge = {
	render: () => ( {
		components: { SectionHeader },
		template: `
			<SectionHeader 
				title="Notifications" 
				icon="🔔"
				:badge="{ text: '12 NEW', variant: 'danger' }"
			/>
		`
	} )
}

// Different variants
export const Variants = {
	render: () => ( {
		components: { SectionHeader },
		template: `
			<div style="display: flex; flex-direction: column; gap: 32px;">
				<SectionHeader 
					title="Primary Section" 
					icon="⭐"
					variant="primary"
				/>
				<SectionHeader 
					title="Secondary Section" 
					icon="📋"
					variant="secondary"
				/>
				<SectionHeader 
					title="Success Section" 
					icon="✅"
					variant="success"
				/>
				<SectionHeader 
					title="Warning Section" 
					icon="⚠️"
					variant="warning"
				/>
				<SectionHeader 
					title="Danger Section" 
					icon="🚨"
					variant="danger"
				/>
				<SectionHeader 
					title="Info Section" 
					icon="ℹ️"
					variant="info"
				/>
			</div>
		`
	} )
}

// Complex example
export const ComplexExample = {
	render: () => ( {
		components: { SectionHeader, KButton },
		data() {
			return {
				searchQuery: ''
			}
		},
		template: `
			<div>
				<SectionHeader 
					title="Facility Bookings" 
					subtitle="Manage gym, party room, and guest parking reservations"
					icon="📅"
					searchable
					searchPlaceholder="Search bookings..."
					v-model:searchQuery="searchQuery"
					:badge="{ text: '3 PENDING', variant: 'warning' }"
				>
					<template #actions>
						<KButton size="sm" variant="ghost" icon="📊">Stats</KButton>
						<KButton size="sm" variant="secondary" icon="📥">Export</KButton>
						<KButton size="sm" variant="primary" icon="➕">New Booking</KButton>
					</template>
				</SectionHeader>
				<div v-if="searchQuery" style="margin-top: 16px; padding: 12px; background: #FFF9C4; border-radius: 8px;">
					Searching for: <strong>{{ searchQuery }}</strong>
				</div>
			</div>
		`
	} )
}

// Mobile responsive
export const MobileView = {
	parameters: {
		viewport: {
			defaultViewport: 'mobile'
		}
	},
	render: () => ( {
		components: { SectionHeader, KButton },
		template: `
			<div style="padding: 16px;">
				<SectionHeader 
					title="Dashboard" 
					icon="📊"
					searchable
				>
					<template #actions>
						<KButton size="sm" variant="primary" icon="➕" />
					</template>
				</SectionHeader>
			</div>
		`
	} )
}