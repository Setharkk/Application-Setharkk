import { defineComponent } from 'vue'

export const GlobalStyle = defineComponent({
  name: 'GlobalStyle',
  setup() {
    const style = document.createElement('style')
    style.innerHTML = `
      :root {
        --primary-color: #4299e1;
        --secondary-color: #2d3748;
        --background-color: #f8fafc;
        --text-color: #1a1c23;
        --border-color: #e2e8f0;
        --success-color: #48bb78;
        --warning-color: #ecc94b;
        --error-color: #f56565;
        --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
          Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
    `
    document.head.appendChild(style)
    return () => null
  }
}) 