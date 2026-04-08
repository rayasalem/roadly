/**
 * Rental: Manage Cars — add / edit / remove vehicles with images and full details.
 * Local state only for now; backend wiring can plug into mutations later.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { PressableCard } from '../../../../shared/components/PressableCard';
import { useTheme, spacing, typography, radii, shadows } from '../../../../shared/theme';
import { blurActiveElementForA11y } from '../../../../shared/utils/domA11y';
import { t } from '../../../../shared/i18n/t';
import { MOCK_CARS } from '../../../../mock/mockCars';

const CAR_IMAGE_PLACEHOLDER = 'https://placehold.co/320x200/e8f4ea/1a472a?text=🚗';

type LocalCar = {
  id: string;
  name: string;
  model: string;
  year: string;
  pricePerDay: string;
  description: string;
  transmission: 'automatic' | 'manual';
  seats: string;
  photoUrl?: string;
};

function mockToLocalCar(m: { id: string; name: string; year: number; pricePerDay: number; transmission: 'automatic' | 'manual'; seats: number }): LocalCar {
  return {
    id: m.id,
    name: m.name,
    model: m.name,
    year: String(m.year),
    pricePerDay: String(m.pricePerDay),
    description: '',
    transmission: m.transmission,
    seats: String(m.seats),
    photoUrl: undefined,
  };
}

const INITIAL_CARS: LocalCar[] = MOCK_CARS.slice(0, 8).map((m) =>
  mockToLocalCar({
    id: m.id,
    name: m.name,
    year: m.year,
    pricePerDay: m.pricePerDay,
    transmission: m.transmission,
    seats: m.seats,
  }),
);

export function RentalCarListScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [cars, setCars] = useState<LocalCar[]>(INITIAL_CARS);
  const [editingCar, setEditingCar] = useState<LocalCar | null>(null);

  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [520, '90%'], []);

  const openAddCar = useCallback(() => {
    setEditingCar({
      id: '',
      name: '',
      model: '',
      year: '',
      pricePerDay: '',
      description: '',
      transmission: 'automatic',
      seats: '5',
      photoUrl: '',
    });
    sheetRef.current?.present();
  }, []);

  const openEditCar = useCallback((car: LocalCar) => {
    setEditingCar({
      ...car,
      transmission: (car as any).transmission ?? 'automatic',
      seats: (car as any).seats ?? '5',
    });
    sheetRef.current?.present();
  }, []);

  const handleDeleteCar = useCallback(
    (car: LocalCar) => {
      Alert.alert(
        t('rental.deleteCarTitle') ?? 'Delete car',
        t('rental.deleteCarConfirm') ?? 'Are you sure you want to remove this car from your fleet?',
        [
          { text: t('common.cancel') ?? 'Cancel', style: 'cancel' },
          {
            text: t('common.delete') ?? 'Delete',
            style: 'destructive',
            onPress: () => setCars((prev) => prev.filter((c) => c.id !== car.id)),
          },
        ],
      );
    },
    [setCars],
  );

  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
    setEditingCar(null);
  }, []);

  const handleSaveCar = useCallback(() => {
    if (!editingCar) return;
    const trimmed: LocalCar = {
      ...editingCar,
      name: editingCar.name.trim(),
      model: editingCar.model.trim(),
      year: editingCar.year.trim(),
      pricePerDay: editingCar.pricePerDay.trim(),
      description: editingCar.description.trim(),
      transmission: editingCar.transmission ?? 'automatic',
      seats: (editingCar.seats ?? '5').trim() || '5',
      photoUrl: editingCar.photoUrl?.trim() ?? '',
    };
    if (!trimmed.name || !trimmed.model || !trimmed.year || !trimmed.pricePerDay) {
      Alert.alert(
        t('common.missingFieldsTitle') ?? 'Missing information',
        t('rental.missingRequiredFields') ??
          'Please fill in at least name, model, year, and price per day.',
      );
      return;
    }
    setCars((prev) => {
      if (!trimmed.id) {
        const id = `car-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        return [{ ...trimmed, id }, ...prev];
      }
      return prev.map((c) => (c.id === trimmed.id ? trimmed : c));
    });
    closeSheet();
  }, [closeSheet, editingCar, setCars]);

  const carImageUri = useCallback((item: LocalCar) => {
    const url = item.photoUrl?.trim();
    return url && (url.startsWith('http://') || url.startsWith('https://')) ? url : CAR_IMAGE_PLACEHOLDER;
  }, []);

  const renderCar = useCallback(
    ({ item }: { item: LocalCar }) => (
      <PressableCard style={styles.card} onPress={() => openEditCar(item)}>
        <View style={styles.cardImageWrap}>
          <Image
            source={{ uri: carImageUri(item) }}
            style={styles.carImage}
            resizeMode="cover"
            {...(Platform.OS === 'android' ? { resizeMethod: 'resize' as const } : {})}
          />
          <View style={styles.cardBody}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {(item.name || t('rental.unnamedCar')) ?? 'Car'}
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.model ? `${item.model} • ${item.year || ''}`.trim() : item.year}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={[styles.price, { color: colors.primary }]} numberOfLines={1}>
                {item.pricePerDay ? `${item.pricePerDay} ${t('rental.pricePerDay') ?? 'per day'}` : ''}
              </Text>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => openEditCar(item)}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleDeleteCar(item)}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </PressableCard>
    ),
    [carImageUri, colors.error, colors.primary, colors.text, colors.textSecondary, handleDeleteCar, openEditCar],
  );

  const keyExtractor = useCallback((item: LocalCar) => item.id, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <AppHeader
        title={t('rental.carList')}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        rightIcon="none"
      />
      <View style={styles.body}>
        <TouchableOpacity
          style={[styles.addBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={openAddCar}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="plus-circle-outline" size={22} color={colors.primary} />
          <Text style={[styles.addBtnText, { color: colors.primary }]}>
            {t('rental.addCar')}
          </Text>
        </TouchableOpacity>
        <FlatList
          data={cars}
          keyExtractor={keyExtractor}
          renderItem={renderCar}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons
                name="car-off"
                size={48}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('rental.noVehicles') ?? 'No cars in your fleet yet.'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t('rental.addCarHint') ??
                  'Add cars to your fleet so customers can request and book them.'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={() => { blurActiveElementForA11y(); closeSheet(); }}
        backgroundStyle={[styles.sheetBg, { backgroundColor: colors.surface }]}
        handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      >
        <KeyboardAvoidingView
          style={styles.sheetKeyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <BottomSheetScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {editingCar?.id
                ? t('rental.editCarTitle') ?? 'Edit car'
                : t('rental.addCarTitle') ?? 'Add car'}
            </Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
              {t('rental.manageCarSubtitle') ??
                'Enter details exactly as customers will see them in the app.'}
            </Text>

            {/* صورة السيارة */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t('rental.carImageLabel') ?? 'Car image'}
            </Text>
            {editingCar?.photoUrl?.trim() ? (
              <View style={styles.imagePreviewWrap}>
                <Image
                  source={{ uri: editingCar.photoUrl.trim().startsWith('http') ? editingCar.photoUrl.trim() : CAR_IMAGE_PLACEHOLDER }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              </View>
            ) : null}
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder={t('rental.photoUrlPlaceholder') ?? 'Image URL (e.g. https://…)'}
              placeholderTextColor={colors.textMuted}
              value={editingCar?.photoUrl ?? ''}
              onChangeText={(text) =>
                setEditingCar((prev) => (prev ? { ...prev, photoUrl: text } : prev))
              }
              keyboardType="url"
              autoCapitalize="none"
            />

            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder={t('rental.carNamePlaceholder') ?? 'Car name (e.g. Toyota Corolla)'}
              placeholderTextColor={colors.textMuted}
              value={editingCar?.name ?? ''}
              onChangeText={(text) =>
                setEditingCar((prev) => (prev ? { ...prev, name: text } : prev))
              }
            />
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder={t('rental.carModelPlaceholder') ?? 'Model / trim (e.g. XLE)'}
              placeholderTextColor={colors.textMuted}
              value={editingCar?.model ?? ''}
              onChangeText={(text) =>
                setEditingCar((prev) => (prev ? { ...prev, model: text } : prev))
              }
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.inputHalf, { borderColor: colors.border, color: colors.text }]}
                placeholder={t('rental.yearPlaceholder') ?? 'Year'}
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                value={editingCar?.year ?? ''}
                onChangeText={(text) =>
                  setEditingCar((prev) => (prev ? { ...prev, year: text } : prev))
                }
              />
              <TextInput
                style={[styles.inputHalf, { borderColor: colors.border, color: colors.text }]}
                placeholder={t('rental.pricePlaceholder') ?? 'Price per day (e.g. 150)'}
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={editingCar?.pricePerDay ?? ''}
                onChangeText={(text) =>
                  setEditingCar((prev) => (prev ? { ...prev, pricePerDay: text } : prev))
                }
              />
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t('rental.transmissionLabel') ?? 'Transmission'}
            </Text>
            <View style={styles.transmissionRow}>
              <TouchableOpacity
                style={[
                  styles.transmissionBtn,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  editingCar?.transmission === 'automatic' && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setEditingCar((prev) => (prev ? { ...prev, transmission: 'automatic' as const } : prev))}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={20}
                  color={editingCar?.transmission === 'automatic' ? colors.primaryContrast : colors.text}
                />
                <Text style={[styles.transmissionBtnText, { color: editingCar?.transmission === 'automatic' ? colors.primaryContrast : colors.text }]}>
                  {t('rental.transmissionAutomatic') ?? 'Automatic'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.transmissionBtn,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  editingCar?.transmission === 'manual' && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setEditingCar((prev) => (prev ? { ...prev, transmission: 'manual' as const } : prev))}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="cog"
                  size={20}
                  color={editingCar?.transmission === 'manual' ? colors.primaryContrast : colors.text}
                />
                <Text style={[styles.transmissionBtnText, { color: editingCar?.transmission === 'manual' ? colors.primaryContrast : colors.text }]}>
                  {t('rental.transmissionManual') ?? 'Manual'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t('rental.seatsLabel') ?? 'Number of seats'}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder={t('rental.seatsPlaceholder') ?? 'e.g. 5'}
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={2}
              value={editingCar?.seats ?? ''}
              onChangeText={(text) =>
                setEditingCar((prev) => (prev ? { ...prev, seats: text } : prev))
              }
            />

            <TextInput
              style={[styles.input, styles.multilineInput, { borderColor: colors.border, color: colors.text }]}
              placeholder={t('rental.descriptionPlaceholder') ?? 'Short description (condition, mileage, etc.)'}
              placeholderTextColor={colors.textMuted}
              value={editingCar?.description ?? ''}
              onChangeText={(text) =>
                setEditingCar((prev) => (prev ? { ...prev, description: text } : prev))
              }
              multiline
              numberOfLines={3}
            />

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.border }]}
                onPress={closeSheet}
                activeOpacity={0.85}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                  {t('common.cancel') ?? 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveCar}
                activeOpacity={0.9}
              >
                <Text style={[styles.primaryBtnText, { color: colors.primaryContrast }]}>
                  {t('common.save') ?? 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </KeyboardAvoidingView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  addBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.card,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardImageWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 100,
  },
  carImage: {
    width: 120,
    minHeight: 100,
    backgroundColor: '#e8e8e8',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
  meta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    marginTop: spacing.xs,
  },
  price: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
  },
  iconBtn: {
    paddingHorizontal: spacing.xs,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  sheetBg: {
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    ...shadows.lg,
  },
  sheetKeyboard: {
    flex: 1,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  imagePreviewWrap: {
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 200,
    height: 120,
    backgroundColor: '#eee',
  },
  transmissionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  transmissionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  transmissionBtnText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
  },
  sheetTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  sheetSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    marginBottom: spacing.sm,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    marginBottom: spacing.sm,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
});
