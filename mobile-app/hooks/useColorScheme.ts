import { useColorScheme as _useColorScheme } from 'react-native';

// Хук для получения текущей цветовой схемы устройства
export function useColorScheme(): 'light' | 'dark' {
  return _useColorScheme() as 'light' | 'dark';
}
