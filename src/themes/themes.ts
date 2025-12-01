// src/theme/theme.ts
export interface ThemeColors {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    overlay: string;
  }
  
  export interface Theme {
    name: string;
    colors: ThemeColors;
  }
  
  export const lightTheme: Theme = {
    name: 'light',
    colors: {
      primary: 'rgb(99 102 241)', // indigo-500
      primaryLight: 'rgb(129 140 248)', // indigo-400
      primaryDark: 'rgb(79 70 229)', // indigo-600
      secondary: 'rgb(244 63 94)', // rose-500
      background: 'rgb(255 255 255)', // white
      surface: 'rgb(248 250 252)', // slate-50
      surfaceVariant: 'rgb(241 245 249)', // slate-100
      text: 'rgb(30 41 59)', // slate-800
      textSecondary: 'rgb(100 116 139)', // slate-500
      border: 'rgb(99 102 240)', // slate-200
      error: 'rgb(239 68 68)', // red-500
      success: 'rgb(16 185 129)', // emerald-500
      warning: 'rgb(245 158 11)', // amber-500
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  };
  
  export const darkTheme: Theme = {
    name: 'dark',
    colors: {
      primary: 'rgb(129 140 248)', // indigo-400
      primaryLight: 'rgb(165 180 252)', // indigo-300
      primaryDark: 'rgb(99 102 241)', // indigo-500
      secondary: 'rgb(244 114 182)', // pink-400
      background: 'rgb(15 23 42)', // slate-900
      surface: 'rgb(30 41 59)', // slate-800
      surfaceVariant: 'rgb(51 65 85)', // slate-700
      text: 'rgb(241 245 249)', // slate-100
      textSecondary: 'rgb(203 213 225)', // slate-300
      border: 'rgb(71 85 105)', // slate-600
      error: 'rgb(248 113 113)', // red-400
      success: 'rgb(52 211 153)', // emerald-400
      warning: 'rgb(251 191 36)', // amber-400
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  };
  
  export const themes = {
    light: lightTheme,
    dark: darkTheme,
  };
  
  export type ThemeName = keyof typeof themes;