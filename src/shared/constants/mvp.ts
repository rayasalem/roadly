export const MVP_FEATURES = {
  payments: false,
  favorites: false,
  fullSupport: false,
} as const;

export function isMvpFeatureEnabled(feature: keyof typeof MVP_FEATURES): boolean {
  return MVP_FEATURES[feature];
}

