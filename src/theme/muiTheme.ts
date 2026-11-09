import { createTheme } from '@mui/material/styles';

export const androidBlackTealTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#14b8a6', // Teal 500
      light: '#5eead4', // Teal 300
      dark: '#0f766e', // Teal 700
      contrastText: '#000000',
    },
    secondary: {
      main: '#2dd4bf', // Teal 400
      light: '#99f6e4', // Teal 200
      dark: '#115e59', // Teal 800
      contrastText: '#000000',
    },
    background: {
      default: '#000000',
      paper: '#060e0e',
    },
    text: {
      primary: '#2dd4bf',
      secondary: '#14b8a6',
      disabled: '#0f766e',
    },
    divider: 'rgba(20, 184, 166, 0.2)',
    success: {
      main: '#2dd4bf',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#f43f5e',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#5eead4',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#5eead4',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#2dd4bf',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#000000',
          color: '#2dd4bf',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#060e0e',
          border: '1px solid rgba(20, 184, 166, 0.22)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 44,
          padding: '8px 18px',
          whiteSpace: 'nowrap',
        },
        contained: {
          backgroundColor: '#14b8a6',
          color: '#000000',
          fontWeight: 700,
          '&:hover': {
            backgroundColor: '#2dd4bf',
          },
        },
        outlined: {
          borderColor: 'rgba(45, 212, 191, 0.4)',
          color: '#2dd4bf',
          '&:hover': {
            borderColor: '#5eead4',
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#2dd4bf',
          minWidth: 44,
          minHeight: 44,
          '&:hover': {
            backgroundColor: 'rgba(20, 184, 166, 0.14)',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: '#0f766e',
          '&.Mui-checked': {
            color: '#2dd4bf',
          },
          '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#14b8a6',
            opacity: 0.5,
          },
        },
        track: {
          backgroundColor: '#134e4a',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#14b8a6',
        },
        thumb: {
          backgroundColor: '#5eead4',
          border: '2px solid #000000',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(3, 9, 9, 0.94)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(20, 184, 166, 0.22)',
          height: 64,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: 'rgba(45, 212, 191, 0.55)',
          minWidth: 64,
          '&.Mui-selected': {
            color: '#5eead4',
          },
        },
        label: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.72rem',
          fontWeight: 600,
          '&.Mui-selected': {
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#5eead4',
            fontFamily: "'JetBrains Mono', monospace",
            backgroundColor: '#020606',
            '& fieldset': {
              borderColor: 'rgba(20, 184, 166, 0.35)',
            },
            '&:hover fieldset': {
              borderColor: '#2dd4bf',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#5eead4',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#14b8a6',
          },
        },
      },
    },
  },
});
