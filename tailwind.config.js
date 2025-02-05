/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

const hexToRgb = hex => {
	const bigint = parseInt(hex.substring(1), 16)
	const r = (bigint >> 16) & 255
	const g = (bigint >> 8) & 255
	const b = bigint & 255

	return `${r}, ${g}, ${b}`
}

module.exports = {
	darkMode: 'selector',
	content: ['./**/*.{html,js}'],
	plugins: [
		require('tailwind-hamburgers'),
		plugin(function ({ addComponents, theme }) {
			addComponents({
				'.list-with-circle-check': {
					li: {
						'&::before': {
							content:
								'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuMjUgOS43NUw3LjUgMTJMMTIuNzUgNiIgc3Ryb2tlPSIjMTIyMzQ1IiBzdHJva2Utb3BhY2l0eT0iMC41IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							height: '1.125rem',
							width: '1.125rem',
							marginTop: '6.3px',
						},
					},
				},
				'.btn': {
					cursor: 'pointer',
					height: '2.25rem', // 36px
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: '0.875rem',
					fontWeight: 500,
					padding: '0.375rem 0.75rem',
					borderRadius: '0.375rem',
					gap: '0.5rem',
					position: 'relative',
					transition: 'all ease .2s',
				},
				'.btn-hover-right': {
					paddingRight: '2.75rem !important',
					svg: {
						position: 'absolute',
						transition: 'all ease-in-out .2s',
						right: '1.25rem',
						top: '50%',
						transform: 'translateY(-50%)',
					},
					'&:hover': {
						svg: {
							right: '15px',
						},
					},
				},
				'.btn-long-hover-right': {
					paddingRight: '2.5rem !important',
					svg: {
						position: 'absolute',
						transition: 'all ease-in-out .2s',
						right: '1rem',
						top: '50%',
						transform: 'translateY(-50%)',
					},
					'&:hover': {
						svg: {
							right: '0.75rem',
						},
					},
				},
				'.btn-border': {
					boxShadow:
						'0 5px 4.5px -1px rgba(18, 35, 69, 0.04), 0 1px 2px 0 rgba(18, 35, 69, 0.05), 0 0 0 1px rgba(18, 35, 69, 0.08)',
					backgroundColor: theme('colors.white'),
					transition: 'all ease .2s',
					'&:hover': {
						backgroundColor: theme('colors.gray[200]'),
					},
				},
				'.btn-primary': {
					boxShadow:
						'0 1px 2px 0 rgba(18, 35, 69, 0.08), 0 0 0 1px rgba(22, 83, 202, 0.8), 0 2px 4.3px -1px rgba(22, 83, 202, 0.4)',
					backgroundColor: theme('colors.blue[500]'),
					color: theme('colors.white'),
					transition: 'all ease .2s',
					'&:hover': {
						backgroundColor: `rgba(${hexToRgb(theme('colors.blue[500]'))}, 0.9)`,
					},
				},
				'.btn-dark': {
					boxShadow:
						'0 1px 2px 0 rgba(18, 35, 69, 0.08), 0 0 0 1px rgba(10, 22, 44, 0.8), 0 2px 4.3px -1px rgba(12, 25, 50, 0.4)',
					backgroundColor: theme('colors.blue[900]'),
					color: theme('colors.white'),
					'&:hover': {
						backgroundColor: `rgba(${hexToRgb(theme('colors.blue[900]'))}, 0.9)`,
					},
				},
				'.btn-violet': {
					boxShadow:
						'0 1px 2px 0 rgba(18, 35, 69, 0.08), 0 0 0 1px rgba(107, 29, 210, 0.8), 0 2px 4.3px -1px rgba(106, 26, 211, 0.4)',
					backgroundColor: theme('colors.violet[600]'),
					color: theme('colors.white'),
					'&:hover': {
						backgroundColor: `rgba(${hexToRgb(theme('colors.violet[600]'))}, 0.9)`,
					},
				},
				'.btn-dark-contact': {
					backgroundColor: '#131320',
					color: theme('colors.white'),
					boxShadow:
						'0px 0px 0px 1px rgba(255, 255, 255, 0.12), 0px 1px 2px rgba(18, 35, 69, 0.05), 0px 5px 4.5px -1px rgba(18, 35, 69, 0.04)',
					color: theme('colors.white'),
					'&:hover': {
						backgroundColor: '#161625',
					},
				},
				'.btn-vivid-blue': {
					boxShadow:
						'0px 2px 4.3px -1px rgba(22, 159, 202, 0.4), 0px 0px 0px 1px rgba(9, 154, 199, 0.85), 0px 1px 2px rgba(18, 60, 69, 0.08)',
					backgroundColor: theme('colors.blue[400]'),
					color: theme('colors.white'),
					'&:hover': {
						backgroundColor: `rgba(${hexToRgb(theme('colors.blue[400]'))}, 0.9)`,
					},
				},
				'.btn-yellow': {
					boxShadow:
						'0 1px 2px 0 rgba(18, 35, 69, 0.08), 0 0 0 1px #fdbb05, 0 2px 4.3px -1px rgba(178, 131, 0, 0.4)',
					backgroundColor: theme('colors.yellow[600]'),
					color: theme('colors.black'),
					'&:hover': {
						backgroundColor: `rgba(${hexToRgb(theme('colors.yellow[600]'))}, 0.9)`,
					},
				},
				'.btn-orange': {
					boxShadow:
						'0px 2px 4.3px -1px rgba(217, 94, 26, 0.4), 0px 0px 0px 1px #E15B22, 0px 1px 2px rgba(31, 18, 69, 0.08)',
					backgroundColor: theme('colors.orange[500]'),
					color: theme('colors.white'),
					'&:hover': {
						backgroundColor: `rgba(${hexToRgb(theme('colors.orange[500]'))}, 0.9)`,
					},
				},
				'.btn-long': {
					position: 'relative',
					display: 'flex',
					alignItems: 'center',
					height: '2.25rem',
					padding: '0 1rem',
					color: theme('colors.white'),
					backgroundColor: theme('colors.violet[500]'),
					gap: '0.5rem',
					borderRadius: '5.625rem',
					fontSize: '1.125rem',
					fontWeight: 500,
					lineHeight: '1.25rem',
					letterSpacing: '-0.22px',
				},
				'.btn-gradient': {
					backgroundImage:
						'linear-gradient(to bottom, #9452ff, #9452ff), linear-gradient(to bottom, #9c5fff, #d884ff), linear-gradient(to bottom, #9059eb, #bc59eb), linear-gradient(to bottom, #fff, #fff)',
				},
				'.btn-m': {
					height: '2.937rem',
				},
				'.btn-s': {
					height: '2.5rem', // 40px
				},
				'.replies-avatars': {
					display: 'flex',
					paddingRight: '0.5625rem',
					'> li': {
						borderWidth: '2px',
						borderColor: theme('colors.gray[200]'),
						position: 'relative',
						marginRight: '-0.5625rem',
						display: 'block',
						width: theme('spacing[9]'),
						height: theme('spacing[9]'),
						borderRadius: '9999px',
						overflow: 'hidden',
						backgroundColor: theme('colors.yellow[600]'),
						'&:nth-child(1)': {
							zIndex: 5,
						},
						'&:nth-child(2)': {
							zIndex: 4,
						},
						'&:nth-child(3)': {
							zIndex: 3,
						},
						'&:nth-child(4)': {
							zIndex: 2,
						},
						'&:nth-child(5)': {
							zIndex: 1,
						},
					},
					'> img': {
						objectFit: 'cover',
						height: '100%',
						width: '100%',
					},
				},
				'.tag': {
					display: 'flex',
					width: 'max-content',
					justifyContent: 'center',
					alignItems: 'center',
					gap: '0.6rem', // 10px
					fontSize: '1rem', // 16px
					letterSpacing: '-0.16px',
					color: theme('colors.blue[900]'),
					fontWeight: 500,
					fontFamily: theme('fontFamily.sans-medium'),
					borderRadius: '99999px',
					padding: '0 0.87rem', // 0.87rem
					height: '2.25rem', // 36px
					border: `2px solid ${theme('colors.blue[900]')}`,
				},
				'.tag-sm': {
					display: 'flex',
					width: 'max-content',
					justifyContent: 'center',
					alignItems: 'center',
					gap: '0.6rem', // 10px
					fontSize: '0.75rem', // 12px
					letterSpacing: '-0.16px',
					color: theme('colors.violet[600]'),
					backgroundColor: `rgba(${hexToRgb(theme('colors.violet[600]'))}, 0.15)`,
					fontWeight: 500,
					fontFamily: theme('fontFamily.sans-medium'),
					borderRadius: '99999px',
					padding: '0 0.5rem', // 8px
					height: '1.4375rem', // 23px
				},
				'.tag-filled': {
					fontFamily: theme('fontFamily.sans-semi'),
					backgroundColor: theme('colors.green[25]'),
					padding: '2px 0.625rem',
					borderRadius: '6px',
					color: theme('colors.green[500]'),
					fontSize: '0.8125rem',
					lineHeight: '1.5rem',
					fontWeight: 600,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					whiteSpace: 'nowrap',
				},
				'.btn-toggle': {
					label: {
						display: 'block',
						width: '36px',
						height: '20px',
						borderRadius: '9999px',
						boxShadow:
							'0px 2.25px 4.5px rgba(3, 7, 18, 0.04), inset 0px 1.125px 1.125px rgba(3, 7, 18, 0.04), inset 0px 2.25px 4.5px rgba(3, 7, 18, 0.04), inset 0px 0px 0px 0.5625px rgba(3, 7, 18, 0.06), inset 0px 0px 9px rgba(3, 7, 18, 0.02)',
						backgroundColor: '#E5E7EB',
						position: 'relative',
						transition: 'all ease .3s',
						// border: `1px solid ${theme('colors.blue[500]')}`,
						cursor: 'pointer',
						'&:after': {
							content: '""',
							width: '16px',
							height: '16px',
							boxShadow:
								'0 0 1px 0 rgba(3, 7, 18, 0.08), 0 1px 2px 0 rgba(3, 7, 18, 0.12), 0 3px 3px 0 rgba(3, 7, 18, 0.04), 0 5px 4px 0 rgba(3, 7, 18, 0.02), 0 0 0 0.5px rgba(3, 7, 18, 0.02), inset 0 1px 0 0 #fff, inset 0 0 2px 1px #fff',
							backgroundColor: theme('colors.white'),
							position: 'absolute',
							top: '50%',
							transform: 'translateY(-50%)',
							right: '17.2px',
							zIndex: 1,
							borderRadius: '9999px',
							transition: 'all ease .3s',
						},
					},
					input: {
						display: 'none',
						'&:checked ~ label::after': {
							right: '2.2px',
						},
						'&:checked ~ label': {
							boxShadow:
								'0 2px 4px 0 rgba(3, 7, 18, 0.04), inset 0 0 8px 0 rgba(3, 7, 18, 0.02), inset 0 0 0 0.5px rgba(3, 7, 18, 0.06), inset 0 2px 4px 0 rgba(3, 7, 18, 0.04), inset 0 1px 1px 0 rgba(3, 7, 18, 0.04)',
							backgroundColor: theme('colors.blue[500]'),
						},
					},
				},
				'.label-gradient': {
					backgroundImage:
						'linear-gradient(180deg, #11121f 38.78%, #1E1D33 75.06%)',
				},
				'.main-gradient': {
					backgroundImage:
						'linear-gradient(180deg, rgba(74,122,236,1) 0%, rgba(74,113,241,1) 36%, rgba(78,119,206,0) 93%)',
				},
				'.main-gradient-violet': {
					backgroundImage:
						'linear-gradient(180deg, #6B5EEC 0%, #6B5EEC 36%, rgba(78,119,206,0) 93%)',
				},
				'.main-gradient-vivid-blue': {
					backgroundImage:
						'linear-gradient(180deg, #09B4DC 0%, #09B4DC 36%, rgba(78,119,206,0) 93%)',
				},
				'.main-gradient-orange': {
					backgroundImage:
						'linear-gradient(180deg, #FE6E2B 0%, #FE6E2B 36%, rgba(78,119,206,0) 93%)',
				},
				'.card-gradient': {
					backgroundImage:
						'linear-gradient(180deg, rgba(243, 240, 255, 0.5) -7.92%, rgba(239, 235, 255, 0) 53.46%)',
				},
				'.card-gradient-orange': {
					backgroundImage:
						'linear-gradient(180deg, rgba(255, 247, 240, 0.5) -7.92%, rgba(239, 235, 255, 0) 53.46%)',
				},
				'.card-gradient-vivid-blue': {
					backgroundImage:
						'linear-gradient(180deg, rgba(240, 252, 255, 0.5) -7.92%, rgba(240, 252, 255, 0) 53.46%)',
				},
				'.card-gradient-blue': {
					backgroundImage:
						'linear-gradient(180deg, rgba(219, 232, 255, 0.6) -7.92%, rgba(219, 232, 255, 0) 53.46%)',
				},
				'.gradient-white': {
					backgroundImage:
						'linear-gradient(180deg, rgba(255,255,255,0) 24%, rgba(255,255,255,1) 100%)',
				},
				'.gradient-dark': {
					backgroundImage:
						'linear-gradient(180deg, rgba(255,255,255,0) 0%, #131320 100%)',
				},
				'.banner-gradient-top': {
					backgroundImage:
						'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100.65%)',
					opacity: 0.6,
				},
				'.banner-gradient-bottom': {
					backgroundImage:
						'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
					opacity: 0.6,
				},
				'.banner-gradient-top-dark': {
					backgroundImage:
						'linear-gradient(180deg, #131320 0%, rgba(255, 255, 255, 0) 100%)',
					opacity: 0.6,
				},
				'.banner-gradient-bottom-dark': {
					backgroundImage:
						'linear-gradient(180deg, #131320 0%, rgba(255, 255, 255, 0) 100%)',
					opacity: 0.6,
				},
				'.card-gradient-yellow': {
					backgroundImage:
						'linear-gradient(180deg, rgba(255, 188, 3, 0.07) -7.92%, rgba(255, 188, 3, 0) 53.46%)',
				},
				'.card-gradient-violet': {
					backgroundImage:
						'linear-gradient(180deg, rgba(218, 209, 255, 0.6) -32.12%, rgba(243, 240, 255, 0) 34.58%)',
				},
				'.card-gradient-gray': {
					backgroundImage:
						'linear-gradient(180deg, rgba(18, 35, 69, 0.06) -7.92%, rgba(18, 35, 69, 0) 38.29%)',
				},
				'.card-title': {
					fontSize: '1.375rem',
					lineHeight: '1.65rem',
					fontFamily: theme('fontFamily.sans-semi'),
					color: theme('colors.blue[950]'),
					'@media not all and (min-width: 480px)': {
						fontSize: '1rem !important',
						lineHeight: '1.3rem !important',
					},
				},
				'.h2': {
					fontFamily: theme('fontFamily.sans-variable'),
					fontSize: '3rem', // 48px
					textAlign: 'center',
					fontWeight: 600,
					fontStretch: 'normal',
					fontStyle: 'normal',
					lineHeight: '3.75rem', // 60px
					letterSpacing: '-1.44px',
					color: theme('colors.blue[950]'),
					'@media not all and (min-width: 640px)': {
						fontSize: '2.25rem',
						lineHeight: '2.8125rem',
					},
				},
				'.h3': {
					fontFamily: theme('fontFamily.sans-variable'),
					fontSize: '2rem', // 32px
					fontWeight: 600,
					lineHeight: '2.4rem',
					letterSpacing: '-0.22px',
					color: theme('colors.blue[950]'),
					'@media not all and (min-width: 640px)': {
						fontSize: '1.4rem',
						lineHeight: '1.7rem !important',
					},
				},
			})
		}),
	],
	theme: {
		// container: {
		// 	center: true,
		// 	padding: '20px',
		// 	screens: {
		// 		xl: '1200px',
		// 	},
		// },
		// colors: {
		// 	white: colors.white,
		// 	black: colors.black,
		// 	yellow: {
		// 		400: '#DDB51E',
		// 		500: '#FBC045',
		// 		600: '#FFBC03',
		// 		700: '#C88E10',
		// 	},
		// 	gray: {
		// 		100: '#FBFBFD',
		// 		200: '#F8F9FC',
		// 		300: '#f1f2f5',
		// 		400: '#E8E9ED',
		// 		500: '#D9DEE7',
		// 		600: '#D3D6DC',
		// 		700: '#999cb2',
		// 		800: '#59657E',
		// 	},
		// 	orange: {
		// 		100: '#faf6f3',
		// 		500: '#FE6E2B',
		// 		950: '#1e0c04',
		// 	},
		// 	red: {
		// 		500: '#E61320',
		// 	},
		// 	blue: {
		// 		50: '#E9F1F6',
		// 		75: '#F5F9FA',
		// 		100: '#f2f6ff',
		// 		400: '#09B4DC',
		// 		500: '#2F76FF',
		// 		600: '#4C78EA',
		// 		700: '#1c5ddf',
		// 		800: '#082A35',
		// 		900: '#122345',
		// 		950: '#130c3e',
		// 		1000: '#091329',
		// 	},
		// 	violet: {
		// 		300: '#9489B6',
		// 		400: '#9F99B2',
		// 		500: '#6259EB',
		// 		600: '#9452FF',
		// 		700: '#27293D',
		// 		800: '#1E1D33',
		// 		850: '#181729',
		// 		900: '#060515',
		// 	},
		// 	green: {
		// 		25: '#D1FAE5',
		// 		400: '#429D17',
		// 		500: '#047857',
		// 	},
		// },
		// fontFamily: {
		// 	sans: ['Inter', ...defaultTheme.fontFamily.sans],
		// 	'sans-semi': ['GeneralSans-semibold', ...defaultTheme.fontFamily.sans],
		// 	'sans-variable': [
		// 		'GeneralSans-Variable',
		// 		...defaultTheme.fontFamily.sans,
		// 	],
		// 	'sans-medium': ['GeneralSans-medium', ...defaultTheme.fontFamily.sans],
		// },
		extend: {
			// screens: {
			// 	xxl: '1360px',
			// 	md: '790px', // phones
			// 	xs: '480px', // phones
			// },
			animation: {
				fade: 'fadeIn .3s ease forwards',
				fadeOut: 'fadeOut .3s ease-in-out forwards',
				fadeScaleIn: 'fadeScaleIn .8s ease-in-out forwards',
				rotateUp: 'rotateUp .5s ease forwards',
				slideUp: 'slideUp .9s ease forwards',
			},
			keyframes: {
				fadeIn: {
					from: { opacity: 0 },
					to: { opacity: 1 },
				},
				fadeOut: {
					from: { opacity: 1 },
					to: { opacity: 0 },
				},
				fadeScaleIn: {
					from: { opacity: 0, transform: 'scale(1.05)' },
					to: { opacity: 1, transform: 'scale(1)' },
				},
				rotateUp: {
					from: { marginBottom: '-80px', transform: 'rotate(5deg)' },
					to: { marginBottom: '0px', transform: 'rotate(0deg)' },
				},
				slideUp: {
					from: { opacity: 0, transform: 'translateY(20px)' },
					to: { opacity: 1, transform: 'translateY(0)' },
				},
			},
			ringWidth: {
				2.5: '2.5px',
			},
			// fontSize: {
			// 	'6xl': ['3rem', '3.75rem'], // 48px 60px
			// 	'4.5xl': ['2.5rem', '125%'],
			// 	'2.5xl': ['1.75rem', '2.45rem'],
			// 	base: ['1rem', '1.42rem'],
			// 	lg: ['1.125rem', '1.6875rem'], // 18px
			// 	sm: ['0.9375rem', '1.25rem'],
			// 	m: ['0.9375rem', '1.5rem'],
			// 	s: ['0.8125rem', '1.0562rem'],
			// },
			// lineHeight: {
			// 	5.5: '1.42rem', // 22.72px
			// 	5.8: '1.5rem', // 24px
			// 	6: '1.575rem', // 25.2px
			// 	6.5: '1.6875rem', // 27px
			// 	9.5: '2.4rem', // 38.4px
			// },
			// zIndex: {
			// 	1: '1',
			// },
			backgroundPosition: {
				'center-top': 'center top',
			},
			// letterSpacing: {
			// 	0.4: '-0.4px',
			// 	0.22: '-0.22px',
			// 	normal: '-0.22px',
			// 	base: 'normal',
			// 	0.56: '-0.56px',
			// 	1.44: '-1.44px',
			// },
			borderRadius: {
				'2.5xl': '20px',
			},
			// boxShadow: {
			// 	'inset-3xl':
			// 		'inset 0px -0.876389px 0.876389px 0.876389px rgba(17, 34, 69, 0.12)',
			// 	card: '0 2px 8px -1px #130c3e0a, 0 0 0 1px #130c3e1c, 0 4px 4px -5px #130c3e40;',
			// 	violet:
			// 		'0 1px 2px 0 rgba(31, 18, 69, 0.08), 0 0 0 1px rgba(58, 22, 202, 0.75), 0 2px 4.3px -1px rgba(58, 22, 202, 0.4)',
			// 	'card-use-cases': '0px 5px 30.9px -4px rgba(58, 68, 89, 0.27)',
			// 	'card-dark': '0px 1px 7px rgba(15, 28, 53, 0.04)',
			// 	'card-dark-contact':
			// 		'0px 2.85px 18.335px 3.8px rgba(0, 0, 0, 0.1), inset 0px 0px 0px 1.02317px rgba(255, 255, 255, 0.04)',
			// 	'card-dark-menu':
			// 		'0px 11.4701px 23.7768px -5.01619px rgba(255, 255, 255, 0.07), 0px 2px 7px -1px rgba(255, 255, 255, 0.04), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.12)',
			// 	'card-orange':
			// 		'0px 4px 4px -5px rgba(30, 12, 4, 0.25), 0px 0px 0px 1px rgba(34, 14, 5, 0.08), 0px 1px 7px rgba(30, 12, 4, 0.04)',
			// 	'card-white':
			// 		'0px 1px 6.3px -1px rgba(18, 35, 69, 0.1), 0px 0px 0px 1px rgba(18, 35, 69, 0.075)',
			// 	img: '0 23.8px 30.3px 0 #0f1c3511, 0 0 0 0.8px #12234513, 0 0.8px 5px -0.8px #12234519, 0 3.2px 3.2px -4px #12234540, 0 0.8px 1.6px 0 #1223450f, 0 -2px 20.6px 0 #0000000c',
			// 	banner:
			// 		'0px 1px 3px rgba(18, 35, 69, 0.1), 0px 1px 2px rgba(18, 35, 69, 0.06), inset 0px 0px 0px 1px rgba(18, 35, 69, 0.1)',
			// 	social:
			// 		' 0px 6px 4px -2px rgba(18, 35, 69, 0.03), 0px 5.01227px 40.0982px -1px rgba(100, 109, 134, 0.06), 0px 1px 2px rgba(18, 35, 69, 0.05), 0px 0px 0px 1px rgba(217, 222, 231, 0.4)',
			// 	'menu-item':
			// 		'0px 2px 7px -1px rgba(15, 28, 53, 0.04),inset 0px 3px 0px -1px rgba(255, 255, 255, 0.46),inset 0px 0px 0px 1px rgba(18, 35, 69, 0.1),0px 11.47px 23.78px -5.02px rgba(18, 35, 69, 0.07)',
			// 	video:
			// 		'0px 11.4701px 23.7768px -5.01619px rgba(18, 35, 69, 0.07), inset 0px -0.866597px 0.866597px 0.866597px rgba(17, 34, 69, 0.12)',
			// 	avatar:
			// 		'0 7.3px 12.2px -3.8px rgba(18, 35, 69, 0.2), 0 16.4px 35.9px -4.9px rgba(18, 35, 69, 0.09)',
			// },
			// dropShadow: {
			// 	'3xl':
			// 		'drop-shadow(0px 0.876389px 7.01111px rgba(13, 34, 71, 0.08)) drop-shadow(0px -1.85479px 19.4753px rgba(0, 0, 0, 0.05))',
			// },
			spacing: {
				4.5: '1.125rem', // 18px
				6.5: '1.625rem', // 26px
				7.5: '1.875rem', // 30px
				9.5: '2.375rem', // 38px
				13: '3.25rem', // 52px
				15: '3.75rem', // 60px
				15.5: '3.875rem', // 62px
				16.5: '4.25rem', // 68px
				17: '4.5rem', // 72px
				17.5: '4.6875rem', // 75px
				22: '5.625rem', // 90px
				25: '105px', // 105px
				30: '7.5625rem', // 121px
				34: '8.5rem', // 136px
			},
			backgroundImage: {
				main: "url('/assets/images/main-bg.png')",
				'main-ai': "url('/assets/images/features/ai/main-bg.png')",
				'card-right': "url('/assets/images/bg-card-right.png')",
				'card-left-orange': "url('/assets/images/card-bg-orange.png')",
				'card-right-blue': "url('/assets/images/card-bg-blue.png')",
				'card-right-vivid-blue':
					"url('/assets/images/bg-card-right-vivid-blue.png')",
				'video-ai': "url('/assets/images/video-ai-bg.png')",
				'card-dark-center': "url('/assets/images/bg-card-dark.png')",
				'banner-round': "url('/assets/images/banner-bg.png')",
				// 'main-card-gradient': "url('/assets/images/bg-card-blue.png')",
			},
			// opacity: {
			// 	8: '0.08',
			// },
		},
	},
}
