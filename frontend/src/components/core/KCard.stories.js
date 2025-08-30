import KButton from './KButton.vue'
import KCard from './KCard.vue'

export default {
	title: 'Core/KCard',
	component: KCard,
	tags: ['autodocs'],
	argTypes: {
		title: {
			control: 'text'
		},
		description: {
			control: 'text'
		},
		icon: {
			control: 'text'
		},
		variant: {
			control: 'select',
			options: ['default', 'primary', 'success', 'warning', 'danger', 'info']
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg']
		},
		clickable: {
			control: 'boolean'
		},
		active: {
			control: 'boolean'
		},
		outlined: {
			control: 'boolean'
		},
		elevated: {
			control: 'boolean'
		},
		noPadding: {
			control: 'boolean'
		}
	}
}

// Default card
export const Default = {
	args: {
		title: 'Card Title',
		description: 'This is a description of the card content. It provides more context about what the card represents.'
	}
}

// With icon
export const WithIcon = {
	args: {
		icon: '📄',
		title: 'Documents',
		description: 'View and manage all your building documents and regulations.'
	}
}

// Card variants
export const Variants = {
	render: () => ( {
		components: { KCard },
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
				<KCard
					variant="default"
					title="Default Card"
					description="This is the default card style"
				/>
				<KCard
					variant="primary"
					icon="⭐"
					title="Primary Card"
					description="This card uses the primary color scheme"
				/>
				<KCard
					variant="success"
					icon="✅"
					title="Success Card"
					description="Perfect for positive messages"
				/>
				<KCard
					variant="warning"
					icon="⚠️"
					title="Warning Card"
					description="Use this to highlight important information"
				/>
				<KCard
					variant="danger"
					icon="🚨"
					title="Danger Card"
					description="For critical alerts and errors"
				/>
				<KCard
					variant="info"
					icon="ℹ️"
					title="Info Card"
					description="General information and notices"
				/>
			</div>
		`
	} )
}

// With actions
export const WithActions = {
	render: () => ( {
		components: { KCard, KButton },
		template: `
			<KCard
				icon="📋"
				title="Management Rules"
				description="Review the building management rules and regulations. Last updated: January 2024"
			>
				<template #footer>
					<div style="display: flex; justify-content: flex-end; gap: 8px; width: 100%;">
						<KButton variant="secondary" size="sm">Download PDF</KButton>
						<KButton variant="primary" size="sm">View Document</KButton>
					</div>
				</template>
			</KCard>
		`
	} )
}

// With badge
export const WithBadge = {
	args: {
		icon: '🔧',
		title: 'Maintenance Request',
		description: 'Water leak in bathroom - Unit 502',
		badge: {
			text: 'URGENT',
			variant: 'danger'
		},
		variant: 'warning'
	}
}

// Clickable cards
export const Clickable = {
	render: () => ( {
		components: { KCard },
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
				<KCard
					icon="🏠"
					title="Building Overview"
					description="Click to view detailed building information"
					clickable
					@click="console.log('Building clicked')"
				/>
				<KCard
					icon="📅"
					title="Facility Booking"
					description="Reserve gym, party room, or other facilities"
					clickable
					variant="primary"
					@click="console.log('Booking clicked')"
				/>
				<KCard
					icon="💬"
					title="Messages"
					description="3 new messages from management"
					clickable
					:badge="{ text: '3 NEW', variant: 'primary' }"
					@click="console.log('Messages clicked')"
				/>
			</div>
		`
	} )
}

// Card sizes
export const Sizes = {
	render: () => ( {
		components: { KCard },
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
				<KCard
					size="sm"
					title="Small Card"
					description="Compact padding for dense layouts"
				/>
				<KCard
					size="md"
					title="Medium Card"
					description="Default size with comfortable spacing"
				/>
				<KCard
					size="lg"
					title="Large Card"
					description="Generous padding for prominent content"
				/>
			</div>
		`
	} )
}

// Card states
export const States = {
	render: () => ( {
		components: { KCard },
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
				<KCard
					title="Normal Card"
					description="Default card state"
				/>
				<KCard
					title="Active Card"
					description="This card is currently active/selected"
					active
				/>
				<KCard
					title="Outlined Card"
					description="Card with outline style"
					outlined
				/>
				<KCard
					title="Elevated Card"
					description="Card with shadow elevation"
					elevated
				/>
			</div>
		`
	} )
}

// Complex content
export const ComplexContent = {
	render: () => ( {
		components: { KCard, KButton },
		template: `
			<KCard
				icon="🏢"
				title="Sakura Tower"
				variant="primary"
			>
				<div style="display: grid; gap: 12px;">
					<div style="display: flex; justify-content: space-between;">
						<span style="color: #666;">Address:</span>
						<span>Shibuya, Tokyo</span>
					</div>
					<div style="display: flex; justify-content: space-between;">
						<span style="color: #666;">Units:</span>
						<span>120</span>
					</div>
					<div style="display: flex; justify-content: space-between;">
						<span style="color: #666;">Occupancy:</span>
						<span style="color: #4CAF50; font-weight: 600;">95%</span>
					</div>
					<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E0E0E0;">
						<h4 style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Facilities</h4>
						<div style="display: flex; gap: 8px; flex-wrap: wrap;">
							<span style="padding: 4px 8px; background: #FFF9C4; border-radius: 12px; font-size: 12px;">🏋️ Gym</span>
							<span style="padding: 4px 8px; background: #FFF9C4; border-radius: 12px; font-size: 12px;">🏊 Pool</span>
							<span style="padding: 4px 8px; background: #FFF9C4; border-radius: 12px; font-size: 12px;">🚗 Parking</span>
							<span style="padding: 4px 8px; background: #FFF9C4; border-radius: 12px; font-size: 12px;">🎉 Party Room</span>
						</div>
					</div>
				</div>
				<template #footer>
					<div style="display: flex; justify-content: space-between; width: 100%;">
						<KButton variant="secondary" size="sm">View Details</KButton>
						<KButton variant="primary" size="sm">Manage</KButton>
					</div>
				</template>
			</KCard>
		`
	} )
}

// Dashboard example
export const DashboardGrid = {
	render: () => ( {
		components: { KCard },
		template: `
			<div>
				<h2 style="margin-bottom: 24px; color: #333;">Quick Actions</h2>
				<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
					<KCard
						icon="📅"
						title="Book Facility"
						description="Reserve gym, party room, or guest parking"
						clickable
						variant="primary"
					/>
					<KCard
						icon="🔧"
						title="Maintenance Request"
						description="Report issues or request repairs"
						clickable
					/>
					<KCard
						icon="💳"
						title="Pay Bills"
						description="View and pay your monthly fees"
						clickable
						:badge="{ text: '2 DUE', variant: 'warning' }"
					/>
					<KCard
						icon="📄"
						title="Documents"
						description="Access building rules and notices"
						clickable
					/>
					<KCard
						icon="📞"
						title="Contact Manager"
						description="Get in touch with building management"
						clickable
					/>
					<KCard
						icon="📢"
						title="Announcements"
						description="Latest news and updates"
						clickable
						:badge="{ text: 'NEW', variant: 'danger' }"
					/>
				</div>
			</div>
		`
	} )
}