// utils/themeColor.js

export function updateThemeColor() {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeColor = isDarkMode ? '#141414' : '#ffffff';
  
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
  
    metaThemeColor.setAttribute('content', themeColor);
  }