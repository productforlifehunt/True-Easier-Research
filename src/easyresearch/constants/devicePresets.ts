export interface DevicePreset {
  id: string;
  label: string;
  width: number;
  height: number;
  brand: 'apple' | 'android';
}

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'iphone-se', label: 'iPhone SE', width: 375, height: 667, brand: 'apple' },
  { id: 'iphone-15', label: 'iPhone 15', width: 393, height: 852, brand: 'apple' },
  { id: 'galaxy-s24', label: 'Galaxy S24', width: 360, height: 780, brand: 'android' },
  { id: 'pixel-8', label: 'Pixel 8', width: 412, height: 915, brand: 'android' },
];

export const DEFAULT_DEVICE = DEVICE_PRESETS[1]; // iPhone 15
