import { createVuetify, ThemeDefinition } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

const lightTheme: ThemeDefinition = {
    dark: false,
    colors: {
        primary: '#1a73e8',
        secondary: '#34a853',
        accent: '#ea4335',
        error: '#dc3545',
        info: '#2196F3',
        success: '#28a745',
        warning: '#ffc107',
        background: '#f5f5f5',
        surface: '#ffffff',
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
        'on-accent': '#FFFFFF',
        'on-error': '#FFFFFF',
        'on-info': '#FFFFFF',
        'on-success': '#FFFFFF',
        'on-warning': '#000000'
    }
};

const darkTheme: ThemeDefinition = {
    dark: true,
    colors: {
        primary: '#2196F3',
        secondary: '#424242',
        accent: '#FF4081',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
        background: '#121212',
        surface: '#1E1E1E',
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
        'on-accent': '#FFFFFF',
        'on-error': '#FFFFFF',
        'on-info': '#FFFFFF',
        'on-success': '#FFFFFF',
        'on-warning': '#000000'
    }
};

export default createVuetify({
    theme: {
        defaultTheme: localStorage.getItem('theme') || 'light',
        themes: {
            light: lightTheme,
            dark: darkTheme
        }
    }
}); 