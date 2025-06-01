export type Theme = 'dark' | 'light';

export const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const getCurrentTheme = (): Theme => {
  const theme = document.documentElement.getAttribute('data-theme') as Theme;
  return theme || 'dark';
};

export const toggleTheme = (): Theme => {
  const currentTheme = getCurrentTheme();
  const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  return newTheme;
};

export const getSystemPreferredTheme = (): Theme => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
};

export const initializeTheme = (): Theme => {
  const savedTheme = localStorage.getItem('theme') as Theme;
  const theme = savedTheme || getSystemPreferredTheme();
  applyTheme(theme);
  return theme;
};

export const saveTheme = (theme: Theme): void => {
  localStorage.setItem('theme', theme);
  applyTheme(theme);
};