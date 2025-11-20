const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	mode: "jit",
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			colors: {
				// Premium black/red/white/grey palette
				gray: {
					50: "#f9fafb",
					100: "#f3f4f6",
					200: "#e5e7eb",
					300: "#d1d5db",
					400: "#9ca3af",
					500: "#6b7280",
					600: "#4b5563",
					700: "#374151",
					800: "#1f2937",
					900: "#111827",
					950: "#0a0a0a",
				},
				premium: {
					black: "#000000",
					"dark-grey": "#1a1a1a",
					"medium-grey": "#2d2d2d",
					"light-grey": "#404040",
					red: "#dc2626",
					"red-dark": "#991b1b",
					"red-light": "#ef4444",
					"red-glow": "#fee2e2",
					white: "#ffffff",
					"off-white": "#f5f5f5",
				},
			},
			fontSize: {
				xxs: "0.625rem",
				smd: "0.94rem",
			},
			boxShadow: {
				'premium': '0 0 20px rgba(220, 38, 38, 0.15)',
				'premium-lg': '0 0 40px rgba(220, 38, 38, 0.2)',
				'premium-hover': '0 0 30px rgba(220, 38, 38, 0.25)',
				'glow-red': '0 0 15px rgba(220, 38, 38, 0.5)',
				'glow-white': '0 0 10px rgba(255, 255, 255, 0.3)',
				'inset-premium': 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
			},
			animation: {
				'fade-in': 'fadeIn 0.3s ease-in-out',
				'slide-up': 'slideUp 0.4s ease-out',
				'slide-down': 'slideDown 0.4s ease-out',
				'slide-right': 'slideRight 0.3s ease-out',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'shimmer': 'shimmer 2s linear infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideDown: {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideRight: {
					'0%': { transform: 'translateX(-10px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				glow: {
					'0%': { boxShadow: '0 0 5px rgba(220, 38, 38, 0.2)' },
					'100%': { boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' },
				},
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-premium': 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
				'gradient-red': 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
				'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent)',
			},
			backdropBlur: {
				xs: '2px',
			},
		},
	},
	plugins: [
		require("tailwind-scrollbar")({ nocompatible: true }),
		require("@tailwindcss/typography"),
	],
};
