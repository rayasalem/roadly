export type MockLocation = {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
};

export const MOCK_LOCATIONS: MockLocation[] = [
  { id: 'city_center', latitude: 32.2205, longitude: 35.2603, label: 'مركز المدينة' },
  { id: 'north_area', latitude: 32.2301, longitude: 35.255, label: 'المنطقة الشمالية' },
  { id: 'south_highway', latitude: 32.2102, longitude: 35.27, label: 'طريق الجنوب' },
  { id: 'industrial_zone', latitude: 32.225, longitude: 35.2755, label: 'المنطقة الصناعية' },
];

