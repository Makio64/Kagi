import KButton from './KButton.vue'

export default {
	title: 'Core/KButton',
	component: KButton,
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost']
		},
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md', 'lg', 'xl']
		},
		type: {
			control: 'select',
			options: ['button', 'submit', 'reset']
		},
		block: {
			control: 'boolean'
		},
		rounded: {
			control: 'boolean'
		},
		outlined: {
			control: 'boolean'
		},
		disabled: {
			control: 'boolean'
		},
		loading: {
			control: 'boolean'
		},
		icon: {
			control: 'text'
		}
	}
}

// Default button
export const Default = {
	args: {
		default: 'Click me'
	}
}

// All variants
export const Variants = {
	render: () => ( {
		components: { KButton },
		template: `
			<div style="display: flex; gap: 12px; flex-wrap: wrap;">
				<KButton variant="primary">Primary</KButton>
				<KButton variant="secondary">Secondary</KButton>
				<KButton variant="success">Success</KButton>
				<KButton variant="danger">Danger</KButton>
				<KButton variant="warning">Warning</KButton>
				<KButton variant="info">Info</KButton>
				<KButton variant="ghost">Ghost</KButton>
			</div>
		`
	} )
}

// All sizes
export const Sizes = {
	render: () => ( {
		components: { KButton },
		template: `
			<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
				<KButton size="xs">Extra Small</KButton>
				<KButton size="sm">Small</KButton>
				<KButton size="md">Medium</KButton>
				<KButton size="lg">Large</KButton>
				<KButton size="xl">Extra Large</KButton>
			</div>
		`
	} )
}

// Outlined variants
export const Outlined = {
	render: () => ( {
		components: { KButton },
		template: `
			<div style="display: flex; gap: 12px; flex-wrap: wrap;">
				<KButton variant="primary" outlined>Primary</KButton>
				<KButton variant="secondary" outlined>Secondary</KButton>
				<KButton variant="success" outlined>Success</KButton>
				<KButton variant="danger" outlined>Danger</KButton>
				<KButton variant="warning" outlined>Warning</KButton>
				<KButton variant="info" outlined>Info</KButton>
			</div>
		`
	} )
}

// With icons
export const WithIcons = {
	render: () => ( {
		components: { KButton },
		template: `
			<div style="display: flex; gap: 12px; flex-wrap: wrap;">
				<KButton icon="📄">Documents</KButton>
				<KButton icon="🏠" variant="primary">Home</KButton>
				<KButton icon="⚙️" variant="secondary">Settings</KButton>
				<KButton icon="✅" variant="success">Save</KButton>
				<KButton icon="🗑️" variant="danger">Delete</KButton>
			</div>
		`
	} )
}

// Icon only buttons
export const IconOnly = {
	render: () => ( {
		components: { KButton },
		template: `
			<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
				<KButton icon="✏️" size="xs" />
				<KButton icon="🗑️" size="sm" variant="danger" />
				<KButton icon="⚙️" size="md" variant="secondary" />
				<KButton icon="➕" size="lg" variant="primary" />
				<KButton icon="❌" size="xl" variant="danger" rounded />
			</div>
		`
	} )
}

// States
export const States = {
	args: {
		disabled: false,
		outlined: false,
		type: "button",
		variant: "secondary",
		size: "xs",
		icon: "test"
	},

	render: () => ( {
		components: { KButton },
		template: `
			<div style="display: flex; gap: 12px; flex-wrap: wrap;">
				<KButton>Normal</KButton>
				<KButton disabled>Disabled</KButton>
				<KButton loading>Loading</KButton>
				<KButton variant="primary" loading>Primary Loading</KButton>
			</div>
		`
	} )
}

// Block buttons
export const BlockButtons = {
	render: () => ( {
		components: { KButton },
		template: `
			<div style="max-width: 400px; display: flex; flex-direction: column; gap: 12px;">
				<KButton block variant="primary">Primary Block Button</KButton>
				<KButton block variant="secondary">Secondary Block Button</KButton>
				<KButton block variant="success" icon="✅">Success with Icon</KButton>
			</div>
		`
	} )
}

// Rounded buttons
export const Rounded = {
	render: () => ( {
		components: { KButton },
		template: `
			<div style="display: flex; gap: 12px; flex-wrap: wrap;">
				<KButton rounded>Rounded</KButton>
				<KButton rounded variant="primary">Primary Rounded</KButton>
				<KButton rounded outlined variant="danger">Outlined Rounded</KButton>
				<KButton rounded icon="❤️">With Icon</KButton>
			</div>
		`
	} )
}