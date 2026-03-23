import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import type { Provider } from '../domain/types';
import { ProviderCard } from '../../../shared/components/ProviderCard';
import { spacing } from '../../../shared/theme';
import { Skeleton } from '../../../shared/components/Skeleton';

export interface NearbyProvidersListProps {
  providers: Provider[];
  onSelect: (provider: Provider) => void;
  onRequest: (provider: Provider) => void;
  loading?: boolean;
}

const ITEM_SEPARATOR_HEIGHT = spacing.card;

export const NearbyProvidersList = React.memo(function NearbyProvidersList({
  providers,
  onSelect,
  onRequest,
  loading,
}: NearbyProvidersListProps) {
  const keyExtractor = useCallback((item: Provider) => item.id, []);

  const renderItem: ListRenderItem<Provider> = useCallback(
    ({ item }) => (
      <ProviderCard
        provider={item}
        onPress={onSelect}
        onRequest={onRequest}
      />
    ),
    [onRequest, onSelect],
  );

  const ItemSeparator = useMemo(
    () =>
      function Separator() {
        return <View style={styles.separator} />;
      },
    [],
  );

  if (loading && providers.length === 0) {
    return (
      <View style={styles.skeletonContainer}>
        {[0, 1, 2].map((key) => (
          <View key={key} style={styles.skeletonRow}>
            <Skeleton width={40} height={40} radius={20} />
            <View style={styles.skeletonMain}>
              <Skeleton height={16} />
              <Skeleton height={12} style={styles.skeletonLine} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={providers}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      windowSize={5}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={50}
    />
  );
});

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.sm,
  },
  separator: {
    height: ITEM_SEPARATOR_HEIGHT,
  },
  skeletonContainer: {
    paddingVertical: spacing.sm,
    gap: ITEM_SEPARATOR_HEIGHT,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  skeletonMain: {
    flex: 1,
    gap: spacing.xs,
  },
  skeletonLine: {
    marginTop: spacing.xs,
    width: '70%',
  },
});

