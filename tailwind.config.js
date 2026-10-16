/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // required for theme switching
    content: [
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.ts',
        './resources/**/*.tsx',
    ],
    theme: {
        extend: {
            backdropBlur: {
                xs: '2px',
            },
            colors: {
                glass: {
                    light: 'rgba(255, 255, 255, 0.55)',
                    dark: 'rgba(20, 20, 22, 0.55)',
                },
            },
        },
    },
    plugins: [],
};