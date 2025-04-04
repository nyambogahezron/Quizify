const Colors = {
	yellow: '#FFD700',
	white: '#FFFFFF',
	grayLight: 'rgba(255, 255, 255, 0.2)',
	background: '#385952',
	background2: '#214b44',
	background3: '#14312b',
	textLight: 'rgba(255, 255, 255, 0.7)',
	white2: '#f2f2f2',
	red1: '#FF6B6B',
	bg3: '#7C3AED',
	primary: '#8B5CF6',
	secondary: '#FFD700',
	dark: '#1A1A1A',
	dim: '#F0F0F0',
	text: '#FFFFFF',
	text2: '#F0F0F0',
	text3: '#F3F3F3',
	warning: '#FFD700',
	success: '#00FF00',
	danger: '#FF0000',
	info: '#0000FF',
	light: '#F0F0F0',
	dark2: '#1A1A1A',
	dim2: '#F0F0F0',
	iconColor: '#467069',
	iconColor2: '#467069',
	borderColor: '#c1e2ce',
	blue: '#0096ff',
};

// Typography
export const FONT = {
	regular: 'SpaceMono-Regular',
	medium: 'SpaceMono-Regular',
	bold: 'SpaceMono-Regular',
};

// Spacing
export const SIZES = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 40,
	xxxl: 80,
};

// Border radius
export const RADIUS = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 24,
	xxl: 32,
	round: 50,
};

// Shadows
export const SHADOWS = {
	small: {
		shadowColor: Colors.dark,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 2,
	},
	medium: {
		shadowColor: Colors.grayLight,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 4.65,
		elevation: 4,
	},
	large: {
		shadowColor: Colors.dark,
		shadowOffset: {
			width: 0,
			height: 6,
		},
		shadowOpacity: 0.37,
		shadowRadius: 7.49,
		elevation: 6,
	},
};

export default Colors;
