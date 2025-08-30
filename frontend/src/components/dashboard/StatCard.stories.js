import StatCard from './StatCard.vue'

export default {
	title: 'Dashboard/StatCard',
	component: StatCard,
	tags: ['autodocs'],
	argTypes: {
		icon: {
			control: 'text',
			description: 'Icon emoji or character'
		},
		label: {
			control: 'text',
			description: 'Label for the statistic'
		},
		value: {
			control: 'text',
			description: 'Main value to display'
		},
		format: {
			control: 'select',
			options: ['number', 'currency', 'percent'],
			description: 'How to format the value'
		},
		variant: {
			control: 'select',
			options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'],
			description: 'Visual variant of the card'
		},
		clickable: {
			control: 'boolean',
			description: 'Makes the card clickable'
		}
	}
}

// Default stat card
export const Default = {
	args: {
		icon: '🏢',
		label: 'Buildings',
		value: 12,
		format: 'number'
	}
}

// With trend
export const WithTrend = {
	args: {
		icon: '👥',
		label: 'Total Residents',
		value: 1248,
		format: 'number',
		trend: {
			text: '+48 this month',
			positive: true
		},
		variant: 'primary'
	}
}

// With negative trend
export const NegativeTrend = {
	args: {
		icon: '🔧',
		label: 'Open Requests',
		value: 23,
		format: 'number',
		trend: {
			text: '8 urgent',
			positive: false
		},
		variant: 'warning'
	}
}

// Currency format
export const CurrencyFormat = {
	args: {
		icon: '💰',
		label: 'Monthly Revenue',
		value: 12500000,
		format: 'currency',
		trend: {
			text: '+12%',
			positive: true
		},
		variant: 'success'
	}
}

// Percentage format
export const PercentageFormat = {
	args: {
		icon: '📊',
		label: 'Occupancy Rate',
		value: 95,
		format: 'percent',
		trend: {
			text: '+3%',
			positive: true
		},
		variant: 'info'
	}
}

// With badge
export const WithBadge = {
	args: {
		icon: '🏠',
		label: 'Units Available',
		value: 5,
		badge: {
			text: 'LOW',
			variant: 'warning'
		},
		variant: 'secondary'
	}
}

// All variants grid
export const AllVariants = {
	render: () => ( {
		components: { StatCard },
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
				<StatCard
					icon="📊"
					label="Default"
					:value="100"
					variant="default"
				/>
				<StatCard
					icon="🏢"
					label="Primary"
					:value="12"
					variant="primary"
					:trend="{ text: '+2 new', positive: true }"
				/>
				<StatCard
					icon="👥"
					label="Secondary"
					:value="450"
					variant="secondary"
				/>
				<StatCard
					icon="✅"
					label="Success"
					:value="98"
					format="percent"
					variant="success"
					:trend="{ text: '+5%', positive: true }"
				/>
				<StatCard
					icon="⚠️"
					label="Warning"
					:value="23"
					variant="warning"
					:trend="{ text: '8 urgent', positive: false }"
				/>
				<StatCard
					icon="🚨"
					label="Danger"
					:value="5"
					variant="danger"
					:badge="{ text: 'CRITICAL', variant: 'danger' }"
				/>
				<StatCard
					icon="ℹ️"
					label="Info"
					:value="1250"
					variant="info"
					subtext="Last updated: 2 min ago"
				/>
			</div>
		`
	} )
}

// Clickable cards
export const Clickable = {
	render: () => ( {
		components: { StatCard },
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
				<StatCard
					icon="🏢"
					label="Buildings"
					:value="12"
					variant="primary"
					clickable
					@click="console.log('Buildings clicked')"
				/>
				<StatCard
					icon="👥"
					label="Residents"
					:value="1248"
					variant="secondary"
					clickable
					@click="console.log('Residents clicked')"
				/>
				<StatCard
					icon="💰"
					label="Revenue"
					:value="12500000"
					format="currency"
					variant="success"
					clickable
					@click="console.log('Revenue clicked')"
				/>
			</div>
		`
	} )
}

// Dashboard example
export const DashboardExample = {
	render: () => ( {
		components: { StatCard },
		template: `
			<div>
				<h2 style="margin-bottom: 24px; color: #333;">Management Overview</h2>
				<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
					<StatCard
						icon="🏢"
						label="Buildings"
						:value="12"
						variant="primary"
						:trend="{ text: '+2 this month', positive: true }"
					/>
					<StatCard
						icon="👥"
						label="Total Residents"
						:value="1248"
						variant="secondary"
						:trend="{ text: '+48 this month', positive: true }"
					/>
					<StatCard
						icon="🔧"
						label="Open Requests"
						:value="23"
						variant="warning"
						:trend="{ text: '8 urgent', positive: false }"
					/>
					<StatCard
						icon="💰"
						label="Monthly Revenue"
						:value="12500000"
						format="currency"
						variant="success"
						:trend="{ text: '+12%', positive: true }"
					/>
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
		components: { StatCard },
		template: `
			<div style="padding: 16px;">
				<div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
					<StatCard
						icon="🏢"
						label="Buildings"
						:value="12"
						variant="primary"
					/>
					<StatCard
						icon="👥"
						label="Residents"
						:value="1248"
						variant="secondary"
					/>
				</div>
			</div>
		`
	} )
}