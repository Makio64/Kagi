import { defineComponent } from 'vue'

export default {
	title: 'Core/Font Test',
	parameters: {
		docs: {
			description: {
				component: 'Test component to verify font loading in Storybook'
			}
		}
	}
}

const FontTestComponent = defineComponent( {
	template: `
		<div class="font-test">
			<h1>Font Test - System Font Stack</h1>
			<p style="font-size: 18px;">
				This text should use the system font stack:<br>
				-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
			</p>
			
			<div style="margin-top: 30px;">
				<h2>Font Weights Test</h2>
				<p style="font-weight: 400;">Regular (400): The quick brown fox jumps over the lazy dog</p>
				<p style="font-weight: 500;">Medium (500): The quick brown fox jumps over the lazy dog</p>
				<p style="font-weight: 600;">Semibold (600): The quick brown fox jumps over the lazy dog</p>
				<p style="font-weight: 700;">Bold (700): The quick brown fox jumps over the lazy dog</p>
			</div>
			
			<div style="margin-top: 30px;">
				<h2>Font Sizes Test</h2>
				<p style="font-size: 0.75rem;">XS (0.75rem): The quick brown fox jumps over the lazy dog</p>
				<p style="font-size: 0.875rem;">SM (0.875rem): The quick brown fox jumps over the lazy dog</p>
				<p style="font-size: 1rem;">Base (1rem): The quick brown fox jumps over the lazy dog</p>
				<p style="font-size: 1.125rem;">LG (1.125rem): The quick brown fox jumps over the lazy dog</p>
				<p style="font-size: 1.25rem;">XL (1.25rem): The quick brown fox jumps over the lazy dog</p>
				<p style="font-size: 1.5rem;">XXL (1.5rem): The quick brown fox jumps over the lazy dog</p>
			</div>
			
			<div style="margin-top: 30px; font-family: 'BlackHanSans', sans-serif;">
				<h2>BlackHanSans Font Test (if loaded)</h2>
				<p>If the BlackHanSans font is loaded, this text will appear in that font.</p>
				<p style="font-size: 24px;">가나다라마바사 ABCDEFG 123456</p>
			</div>
			
			<div style="margin-top: 30px;">
				<h2>CSS Variables Test</h2>
				<p style="font-family: var(--font-family); color: var(--color-text);">
					This uses CSS variables from tokens.styl
				</p>
			</div>
		</div>
	`
} )

export const Default = () => FontTestComponent