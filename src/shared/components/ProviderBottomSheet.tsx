/**
 * Map provider callout / bottom sheet: uses ProviderCardContent for avatar, name, role, status, rating, actions.
 */
import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { colors } from '../theme/colors';
import { spacing, shadows } from '../theme';
import { ProviderCardContent } from './ProviderCardContent';
import type { Provider } from '../../features/providers/domain/types';

const SNAP_POINTS = [320, '50%'];

export interface ProviderBottomSheetProps {
  provider: Provider | null;
  onRequestService: (provider: Provider) => void;
  onOpenMap?: () => void;
  /** Called when user taps View Profile (optional). */
  onViewProfile?: (provider: Provider) => void;
  /** Called when user taps Call (optional). */
  onCall?: (provider: Provider) => void;
  /** Called when user taps Chat (optional). */
  onChat?: (provider: Provider) => void;
  onClose: () => void;
  /** When true, disables the Request Service button (e.g. non-customer roles). */
  requestServiceDisabled?: boolean;
  /** Optional distance in km from user to provider (shown when provided). */
  distanceKm?: number | null;
}

export const ProviderBottomSheet = forwardRef<BottomSheetModal, ProviderBottomSheetProps>(
  function ProviderBottomSheet({ provider, onRequestService, onOpenMap, onViewProfile, onCall, onChat, onClose, requestServiceDisabled, distanceKm }, ref) {
    if (!provider) return null;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        onDismiss={() => { blurActiveElementForA11y(); onClose(); }}
        backgroundStyle={[styles.sheetBackground, { backgroundColor: colors.surface }]}
        handleIndicatorStyle={styles.handle}
      >
        <View style={styles.content}>
          <ProviderCardContent
            provider={provider}
            distanceKm={distanceKm ?? undefined}
            onRequestService={onRequestService}
            onOpenMap={onOpenMap}
            onViewProfile={onViewProfile}
            onCall={onCall}
            onChat={onChat}
            requestServiceDisabled={requestServiceDisabled}
          />
        </View>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadows.lg,
  },
  handle: {
    backgroundColor: colors.border,
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
