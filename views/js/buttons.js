const ActiveTheme = {
    color: '#000',
    background: {
	type: 'linear-gradient', start: '#ccc', end: '#999' },
    border: { color: '#666', width: 1, type: 'solid' },
    textShadow: {
	offsetX: 0, offsetY: 1, blur: 0, color: '#ccc' },
    boxShadow: {
	offsetX: 0, offsetY: 1, blur: 0,
	color: 'rgba(255, 255, 255, 0.3)' }
};

const ButtonThemes = {
    brown: {
	normal: {
	    color: '#000',
	    background: {
		type: 'linear-gradient', start: '#e88', end:'#a44' },
	    border: { color: '#999', width: 1, type: 'solid' },
	    textShadow: {
		offsetX: 0, offsetY: 1, blur: 0, color: '#fff' },
	    boxShadow: {
		offsetX: 0, offsetY: 1, blur: 0,
		color: 'rgba(0, 0, 0, 1)' },
	},
	active: ActiveTheme
    },
    red: {
	normal: {
	    color: '#0ff',
	    background: {
		type: 'linear-gradient', start: '#f00', end:'#a00' },
	    border: { color: '#999', width: 1, type: 'solid' },
	    textShadow: {
		offsetX: 0, offsetY: 1, blur: 0, color: '#fff' },
	    boxShadow: {
		offsetX: 0, offsetY: 1, blur: 0,
		color: 'rgba(0, 0, 0, 1)' },
	},
	active: ActiveTheme
    },
    green: {
	normal: {
	    color: '#000',
	    background: {
		type: 'linear-gradient', start: '#afa', end:'#6c6' },
	    border: { color: '#999', width: 1, type: 'solid' },
	    textShadow: {
		offsetX: 0, offsetY: 1, blur: 0, color: '#fff' },
	    boxShadow: {
		offsetX: 0, offsetY: 1, blur: 0,
		color: 'rgba(0, 0, 0, 1)' },
	},
	active: ActiveTheme
    },
    blue: {
	normal: {
	    color: '#000',
	    background: {
		type: 'linear-gradient', start: '#ccf', end:'#88f' },
	    border: { color: '#999', width: 1, type: 'solid' },
	    textShadow: {
		offsetX: 0, offsetY: 1, blur: 0, color: '#fff' },
	    boxShadow: {
		offsetX: 0, offsetY: 1, blur: 0,
		color: 'rgba(0, 0, 0, 1)' },
	},
	active: ActiveTheme
    }
};
