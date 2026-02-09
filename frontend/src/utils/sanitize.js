import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'p',
	'br',
	'hr',
	'ul',
	'ol',
	'li',
	'strong',
	'em',
	'b',
	'i',
	'u',
	's',
	'code',
	'pre',
	'blockquote',
	'a',
	'img',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td',
	'span',
	'div',
	'sub',
	'sup',
	'dl',
	'dt',
	'dd'
]

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']

export function sanitizeHtml( dirty ) {
	return DOMPurify.sanitize( dirty, {
		ALLOWED_TAGS,
		ALLOWED_ATTR,
		ALLOW_DATA_ATTR: false,
		FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input', 'textarea', 'select', 'object', 'embed', 'link'],
		FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style']
	} )
}
