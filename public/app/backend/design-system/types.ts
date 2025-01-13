// Types généraux
export type Size = 'small' | 'medium' | 'large';
export type Variant = 'primary' | 'secondary' | 'outline' | 'text';

// Types des composants
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: Size;
}

export interface CardProps {
  variant?: 'default' | 'elevated' | 'flat';
  interactive?: boolean;
  fullWidth?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Types du thème
export interface Theme {
  colors: {
    primary: {
      main: string;
      light: string;
      dark: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
    };
    neutral: {
      white: string;
      black: string;
      gray: {
        [key: number]: string;
      };
    };
    state: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  spacing: {
    [key: string]: string;
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: {
      [key: string]: string;
    };
    fontWeight: {
      [key: string]: number;
    };
  };
  shadows: {
    [key: string]: string;
  };
  borderRadius: {
    [key: string]: string;
  };
  transitions: {
    [key: string]: string;
  };
} 