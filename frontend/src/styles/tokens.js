// Design System Tokens for Kagi
// Consistent design values used across all dashboards

export const colors = {
	// Primary colors - Yellow theme
	primary: '#FFC107',
	primaryDark: '#FFB300',
	primaryLight: '#FFF9C4',
	primaryLighter: '#FFECB3',
	
	// Gradient definitions
	primaryGradient: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
	lightGradient: 'linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)',
	subtleGradient: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
	
	// Semantic colors
	success: '#4CAF50',
	successLight: '#C8E6C9',
	danger: '#FF5252',
	dangerLight: '#FFCDD2',
	warning: '#FF9800',
	warningLight: '#FFE0B2',
	info: '#2196F3',
	infoLight: '#BBDEFB',
	
	// Neutral colors
	text: '#333333',
	textSecondary: '#666666',
	textLight: '#999999',
	border: '#E0E0E0',
	borderLight: '#F5F5F5',
	background: '#FFFFFF',
	backgroundLight: '#F9F9F9',
	backgroundDark: '#F5F5F5'
}

export const spacing = {
	xs: '0.25rem',   // 4px
	sm: '0.5rem',     // 8px
	md: '1rem',       // 16px
	lg: '1.5rem',     // 24px
	xl: '2rem',       // 32px
	xxl: '3rem',      // 48px
	xxxl: '4rem'      // 64px
}

export const borderRadius = {
	sm: '4px',
	md: '8px',
	lg: '12px',
	xl: '20px',
	round: '50%',
	pill: '50px'
}

export const shadows = {
	sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
	md: '0 4px 8px rgba(0, 0, 0, 0.1)',
	lg: '0 8px 16px rgba(0, 0, 0, 0.12)',
	xl: '0 10px 40px rgba(0, 0, 0, 0.15)',
	
	// Colored shadows
	primary: '0 4px 12px rgba(255, 193, 7, 0.25)',
	primaryLg: '0 8px 24px rgba(255, 193, 7, 0.3)',
	
	// Hover shadows
	hover: '0 8px 20px rgba(0, 0, 0, 0.12)',
	hoverPrimary: '0 8px 20px rgba(255, 193, 7, 0.3)'
}

export const typography = {
	fontFamily: {
		base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		mono: '"Monaco", "Courier New", monospace'
	},
	fontSize: {
		xs: '0.75rem',    // 12px
		sm: '0.875rem',   // 14px
		base: '1rem',     // 16px
		lg: '1.125rem',   // 18px
		xl: '1.25rem',    // 20px
		xxl: '1.5rem',    // 24px
		xxxl: '2rem',     // 32px
		display: '3rem'   // 48px
	},
	fontWeight: {
		normal: 400,
		medium: 500,
		semibold: 600,
		bold: 700
	},
	lineHeight: {
		tight: 1.2,
		normal: 1.5,
		relaxed: 1.8,
		loose: 2
	}
}

export const transitions = {
	fast: 'all 0.15s ease',
	base: 'all 0.2s ease',
	slow: 'all 0.3s ease',
	
	// Specific transitions
	transform: 'transform 0.2s ease',
	opacity: 'opacity 0.2s ease',
	colors: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
	shadow: 'box-shadow 0.3s ease'
}

export const breakpoints = {
	xs: '480px',
	sm: '640px',
	md: '768px',
	lg: '1024px',
	xl: '1280px',
	xxl: '1536px'
}

export const zIndex = {
	dropdown: 1000,
	sticky: 1020,
	fixed: 1030,
	backdrop: 1040,
	modal: 1050,
	popover: 1060,
	tooltip: 1070
}

// Helper function to get CSS variables
export const getCssVar = ( token ) => {
	const tokens = {
		// Colors
		'--color-primary': colors.primary,
		'--color-primary-dark': colors.primaryDark,
		'--color-primary-light': colors.primaryLight,
		'--color-success': colors.success,
		'--color-danger': colors.danger,
		'--color-warning': colors.warning,
		'--color-info': colors.info,
		
		// Spacing
		'--spacing-xs': spacing.xs,
		'--spacing-sm': spacing.sm,
		'--spacing-md': spacing.md,
		'--spacing-lg': spacing.lg,
		'--spacing-xl': spacing.xl,
		
		// Border radius
		'--radius-sm': borderRadius.sm,
		'--radius-md': borderRadius.md,
		'--radius-lg': borderRadius.lg,
		
		// Shadows
		'--shadow-sm': shadows.sm,
		'--shadow-md': shadows.md,
		'--shadow-lg': shadows.lg
	}
	
	return tokens[token] || null
}

// Export as default for easier imports
export default {
	colors,
	spacing,
	borderRadius,
	shadows,
	typography,
	transitions,
	breakpoints,
	zIndex
}