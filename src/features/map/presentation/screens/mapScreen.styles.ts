import { spacing } from '../../../../shared/theme';

export const mapScreenStyles = {
  root: { flex: 1, width: '100%', backgroundColor: '#fff' as const },
  greenCircle: {
    position: 'absolute' as const,
    top: -160,
    alignSelf: 'center' as const,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    justifyContent: 'space-between' as const,
  },
};
