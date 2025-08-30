import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DocumentViewer from '../../components/DocumentViewer.vue'

// Mock the translation plugin
vi.mock( 'vue-tiny-translation', () => ( {
	useTranslation: () => ( {
		$t: ( key ) => key
	} )
} ) )

describe( 'DocumentViewer Component', () => {
	let wrapper

	const defaultProps = {
		title: 'Test Document',
		content: '# Test Content\n\nThis is a test document.',
		lastUpdated: '2024-01-01',
		isAdmin: false,
		documentId: 'doc-123'
	}

	beforeEach( () => {
		// Reset mocks
		vi.clearAllMocks()
	} )

	describe( 'Rendering', () => {
		it( 'should render document content correctly', () => {
			wrapper = mount( DocumentViewer, {
				props: defaultProps,
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			// Check if markdown is rendered
			const content = wrapper.find( '.markdown-body' )
			expect( content.exists() ).toBe( true )
			expect( content.html() ).toContain( '<h1>Test Content</h1>' )
			expect( content.html() ).toContain( '<p>This is a test document.</p>' )
		} )

		it( 'should display last updated date', () => {
			wrapper = mount( DocumentViewer, {
				props: defaultProps,
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const lastUpdated = wrapper.find( '.last-updated' )
			expect( lastUpdated.exists() ).toBe( true )
			expect( lastUpdated.text() ).toContain( '2024-01-01' )
		} )

		it( 'should render navigation buttons', () => {
			wrapper = mount( DocumentViewer, {
				props: defaultProps,
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const backBtn = wrapper.find( '.back-btn' )
			const closeBtn = wrapper.find( '.close-btn' )
			
			expect( backBtn.exists() ).toBe( true )
			expect( closeBtn.exists() ).toBe( true )
		} )

		it( 'should sanitize HTML content for security', () => {
			const maliciousContent = '<script>alert("XSS")</script><p>Safe content</p>'
			
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					content: maliciousContent
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const content = wrapper.find( '.markdown-body' )
			expect( content.html() ).not.toContain( '<script>' )
			expect( content.html() ).toContain( 'Safe content' )
		} )
	} )

	describe( 'Admin Features', () => {
		it( 'should show edit button for admin users', () => {
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					isAdmin: true
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const adminBar = wrapper.find( '.admin-bar' )
			const editBtn = wrapper.find( '.edit-btn' )
			
			expect( adminBar.exists() ).toBe( true )
			expect( editBtn.exists() ).toBe( true )
		} )

		it( 'should not show edit button for non-admin users', () => {
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					isAdmin: false
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const adminBar = wrapper.find( '.admin-bar' )
			expect( adminBar.exists() ).toBe( false )
		} )

		it( 'should switch to edit mode when edit button clicked', async () => {
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					isAdmin: true
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const editBtn = wrapper.find( '.edit-btn' )
			await editBtn.trigger( 'click' )

			// Check if editor is shown
			const editor = wrapper.find( '.editor-container' )
			const textarea = wrapper.find( '.markdown-editor' )
			
			expect( editor.exists() ).toBe( true )
			expect( textarea.exists() ).toBe( true )
			expect( textarea.element.value ).toBe( defaultProps.content )
		} )

		it( 'should show preview while editing', async () => {
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					isAdmin: true
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const editBtn = wrapper.find( '.edit-btn' )
			await editBtn.trigger( 'click' )

			const preview = wrapper.find( '.preview-panel .markdown-body' )
			expect( preview.exists() ).toBe( true )
			expect( preview.html() ).toContain( '<h1>Test Content</h1>' )
		} )

		it( 'should update preview when content changes', async () => {
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					isAdmin: true
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const editBtn = wrapper.find( '.edit-btn' )
			await editBtn.trigger( 'click' )

			const textarea = wrapper.find( '.markdown-editor' )
			await textarea.setValue( '# New Content' )

			const preview = wrapper.find( '.preview-panel .markdown-body' )
			expect( preview.html() ).toContain( '<h1>New Content</h1>' )
		} )

		it( 'should emit save event with updated content', async () => {
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					isAdmin: true
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const editBtn = wrapper.find( '.edit-btn' )
			await editBtn.trigger( 'click' )

			const textarea = wrapper.find( '.markdown-editor' )
			await textarea.setValue( '# Updated Content' )

			const saveBtn = wrapper.find( '.save-btn' )
			await saveBtn.trigger( 'click' )

			expect( wrapper.emitted( 'save' ) ).toBeTruthy()
			expect( wrapper.emitted( 'save' )[0][0] ).toEqual( {
				id: 'doc-123',
				content: '# Updated Content'
			} )
		} )

		it( 'should cancel editing and restore original content', async () => {
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					isAdmin: true
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const editBtn = wrapper.find( '.edit-btn' )
			await editBtn.trigger( 'click' )

			const textarea = wrapper.find( '.markdown-editor' )
			await textarea.setValue( '# Changed Content' )

			const cancelBtn = wrapper.find( '.cancel-btn' )
			await cancelBtn.trigger( 'click' )

			// Should be back to view mode
			const editor = wrapper.find( '.editor-container' )
			expect( editor.exists() ).toBe( false )

			// Content should be original
			const content = wrapper.find( '.markdown-body' )
			expect( content.html() ).toContain( '<h1>Test Content</h1>' )
		} )
	} )

	describe( 'Navigation', () => {
		it( 'should emit close event when close button clicked', async () => {
			wrapper = mount( DocumentViewer, {
				props: defaultProps,
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const closeBtn = wrapper.find( '.close-btn' )
			await closeBtn.trigger( 'click' )

			expect( wrapper.emitted( 'close' ) ).toBeTruthy()
		} )

		it( 'should emit close event when back button clicked', async () => {
			wrapper = mount( DocumentViewer, {
				props: defaultProps,
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const backBtn = wrapper.find( '.back-btn' )
			await backBtn.trigger( 'click' )

			expect( wrapper.emitted( 'close' ) ).toBeTruthy()
		} )
	} )

	describe( 'Markdown Features', () => {
		it( 'should render tables correctly', () => {
			const tableContent = `
| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					content: tableContent
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const content = wrapper.find( '.markdown-body' )
			expect( content.html() ).toContain( '<table>' )
			expect( content.html() ).toContain( '<th>Column 1</th>' )
			expect( content.html() ).toContain( '<td>Cell 1</td>' )
		} )

		it( 'should render code blocks with syntax highlighting', () => {
			const codeContent = '```javascript\nconst test = "hello";\n```'
			
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					content: codeContent
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const content = wrapper.find( '.markdown-body' )
			expect( content.html() ).toContain( '<pre>' )
			expect( content.html() ).toContain( '<code>' )
		} )

		it( 'should render lists correctly', () => {
			const listContent = `
- Item 1
- Item 2
  - Nested item
1. Numbered item
`
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					content: listContent
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const content = wrapper.find( '.markdown-body' )
			expect( content.html() ).toContain( '<ul>' )
			expect( content.html() ).toContain( '<ol>' )
			expect( content.html() ).toContain( '<li>Item 1</li>' )
		} )

		it( 'should handle images in markdown', () => {
			const imageContent = '![Alt text](https://example.com/image.jpg)'
			
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					content: imageContent
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const content = wrapper.find( '.markdown-body' )
			expect( content.html() ).toContain( '<img' )
			expect( content.html() ).toContain( 'alt="Alt text"' )
		} )
	} )

	describe( 'Accessibility', () => {
		it( 'should have proper ARIA attributes', () => {
			wrapper = mount( DocumentViewer, {
				props: defaultProps,
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const closeBtn = wrapper.find( '.close-btn' )
			const backBtn = wrapper.find( '.back-btn' )
			
			expect( closeBtn.attributes( 'title' ) ).toBeDefined()
			expect( backBtn.attributes( 'title' ) ).toBeDefined()
		} )

		it( 'should be keyboard navigable', async () => {
			wrapper = mount( DocumentViewer, {
				props: {
					...defaultProps,
					isAdmin: true
				},
				global: {
					mocks: {
						$t: ( key ) => key
					}
				}
			} )

			const editBtn = wrapper.find( '.edit-btn' )
			expect( editBtn.element.tagName ).toBe( 'BUTTON' )
			
			// Buttons should be focusable
			editBtn.element.focus()
			expect( document.activeElement ).toBe( editBtn.element )
		} )
	} )
} )