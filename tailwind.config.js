module.exports = {
    purge: ['./index.html'],
    theme: {
        screens: {
            'xs': '450px',
            'sm': '640px',
            'md': '768px',
            '2md': '910px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
            '3xl': '1740px',
        },
        extend: {
            colors: {
                'yellow': '#f0d200',
                'bijou': '#222222'
            },
            fontFamily: {
                'sans': ['Work Sans', 'sans-serif'],
                'sourcecode': ['Source Code Pro', 'monospace']
            },
            fontWeight: {
                'light': 300,
                'regular': 400,
                'medium': 500,
                'bold': 700,
                'black': 900,
            },
            boxShadow: {
                'strong': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)'
            },
            spacing: {
                '128': '32rem',
                '144': '36rem',
                '192': '48rem',
                '216': '54rem',
                '256': '64rem',
            }
        }
    }
}