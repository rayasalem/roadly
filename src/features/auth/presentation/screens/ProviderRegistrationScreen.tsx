/**
 * Provider Registration & Availability — تسجيل وتوافر مزود الخدمة.
 * تصميم محدد ودقيق مطابق لـ Uber Driver / Bolt: حقول مرتبة، تحقق هاتف، Checkbox، GPS، ساعات من-إلى، رفع صورة، بطاقات طلبات.
 */
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/RootNavigator';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { t } from '../../../../shared/i18n/t';
import { backChevronForLocale } from '../../../../shared/i18n/rtlUtils';
import { useLocaleStore } from '../../../../store/localeStore';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { useUIStore } from '../../../../store/uiStore';
import { ROLES, type Role } from '../../../../shared/constants/roles';

type Props = NativeStackScreenProps<RootStackParamList, 'ProviderRegister'>;

const PROVIDER_TYPES: { role: Role; key: 'typeMechanic' | 'typeTow' | 'typeRental' | 'typeInsurance' }[] = [
  { role: ROLES.MECHANIC, key: 'typeMechanic' },
  { role: ROLES.MECHANIC_TOW, key: 'typeTow' },
  { role: ROLES.CAR_RENTAL, key: 'typeRental' },
  { role: ROLES.INSURANCE, key: 'typeInsurance' },
];

const MECHANIC_SERVICES: { id: string; key: 'serviceMaintenance' | 'serviceElectric' | 'serviceOilChange' | 'serviceTires' | 'serviceEngine' | 'serviceBrakes' }[] = [
  { id: 'maintenance', key: 'serviceMaintenance' },
  { id: 'electric', key: 'serviceElectric' },
  { id: 'oil', key: 'serviceOilChange' },
  { id: 'tires', key: 'serviceTires' },
  { id: 'engine', key: 'serviceEngine' },
  { id: 'brakes', key: 'serviceBrakes' },
];

const TOW_VEHICLES: { id: string; key: 'vehicleCar' | 'vehicleTruck' | 'vehicleSuv' | 'vehicleMotorcycle' }[] = [
  { id: 'car', key: 'vehicleCar' },
  { id: 'truck', key: 'vehicleTruck' },
  { id: 'suv', key: 'vehicleSuv' },
  { id: 'motorcycle', key: 'vehicleMotorcycle' },
];

const RENTAL_CAR_TYPES: { id: string; key: 'carTypeSedan' | 'carTypeSuv' | 'carTypeHatchback' }[] = [
  { id: 'sedan', key: 'carTypeSedan' },
  { id: 'suv', key: 'carTypeSuv' },
  { id: 'hatchback', key: 'carTypeHatchback' },
];

const MOCK_REQUESTS = [
  { id: '1', customerName: 'أحمد محمد', serviceType: 'صيانة', timeAgo: 'منذ 5 د', address: 'عمان، الدوار السابع' },
  { id: '2', customerName: 'سارة علي', serviceType: 'ونش', timeAgo: 'منذ 12 د', address: 'صويلح، شارع الجامعة' },
];

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isValidPhone = (s: string) => /^[0-9]{8,14}$/.test(s.replace(/\s/g, ''));

// ——— قيم التصميم الثابتة (Uber Driver / Bolt) ———
const HEADER_BG = '#000000';
const HEADER_TITLE_COLOR = '#FFFFFF';
const SCREEN_BG = '#F6F6F6';
const CARD_BG = '#FFFFFF';
const AVAILABLE_BG = '#22C55E';
const UNAVAILABLE_BG = '#EF4444';
const ACCEPT_BTN_BG = '#22C55E';
const DECLINE_BTN_BG = '#EF4444';
const INPUT_BG = '#F6F6F6';
const BORDER_COLOR = '#E5E7EB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const CARD_RADIUS = 16;
const INPUT_HEIGHT = 52;
const MINI_MAP_HEIGHT = 80;

function CheckboxRow({
  label,
  checked,
  onPress,
  style,
}: { label: string; checked: boolean; onPress: () => void; style?: object }) {
  return (
    <TouchableOpacity
      style={[checkboxStyles.row, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <MaterialCommunityIcons
        name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={24}
        color={checked ? colors.primary : TEXT_SECONDARY}
      />
      <AppText variant="body" style={[checkboxStyles.label, !checked && checkboxStyles.labelUnchecked]}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const checkboxStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  label: { color: TEXT_PRIMARY, flex: 1 },
  labelUnchecked: { color: TEXT_SECONDARY },
});

export function ProviderRegistrationScreen({ navigation }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const backIcon = backChevronForLocale(locale);
  const toast = useUIStore((s) => s.toast);
  const [providerType, setProviderType] = useState<Role>(ROLES.MECHANIC);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [available, setAvailable] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [workshopAddress, setWorkshopAddress] = useState('');
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [workingHoursFrom, setWorkingHoursFrom] = useState('');
  const [workingHoursTo, setWorkingHoursTo] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<Set<string>>(new Set());
  const [selectedCarTypes, setSelectedCarTypes] = useState<Set<string>>(new Set());
  const [carsCount, setCarsCount] = useState('');
  const [rentPerHour, setRentPerHour] = useState('');
  const [rentPerDay, setRentPerDay] = useState('');

  const toggleService = useCallback((id: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const toggleVehicle = useCallback((id: string) => {
    setSelectedVehicleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const toggleCarType = useCallback((id: string) => {
    setSelectedCarTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onGpsWorkshop = useCallback(() => {
    toast({ type: 'info', message: t('providerReg.gpsButton') + ' — قيد التكامل' });
  }, [toast]);
  const onGpsLocation = useCallback(() => {
    toast({ type: 'info', message: t('providerReg.gpsButton') + ' — قيد التكامل' });
  }, [toast]);
  const onAddPhoto = useCallback(() => {
    toast({ type: 'info', message: t('providerReg.addPhoto') + ' — قيد التكامل' });
  }, [toast]);

  const onSubmit = useCallback(async () => {
    setError(null);
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password) {
      setError(t('auth.error.requiredAll'));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t('auth.emailInvalid'));
      return;
    }
    if (!isValidPhone(phone)) {
      setError(t('providerReg.phoneInvalid'));
      return;
    }
    toast({ type: 'info', message: 'تسجيل مزود الخدمة قيد التطوير — سيتم ربطه بالـ API' });
  }, [fullName, phone, email, password, toast]);

  const handleAccept = useCallback((id: string) => {
    toast({ type: 'success', message: 'تم قبول الطلب' });
  }, [toast]);
  const handleDecline = useCallback((id: string) => {
    toast({ type: 'info', message: 'تم رفض الطلب' });
  }, [toast]);

  return (
    <View style={[styles.container, { backgroundColor: HEADER_BG }]}>
      {/* ——— 1. الهيدر ——— */}
      <View style={[styles.headerBar, { backgroundColor: HEADER_BG }]}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()} accessibilityRole="button">
          <MaterialCommunityIcons name={backIcon} size={28} color={HEADER_TITLE_COLOR} />
        </TouchableOpacity>
        <AppText variant="title3" weight="semibold" style={[styles.headerTitle, { color: HEADER_TITLE_COLOR }]}>
          {t('providerReg.title')}
        </AppText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: SCREEN_BG }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardWrap}>
          {/* ——— 2. زر التوافر الكبير (أعلى الصفحة) ——— */}
          <View style={[styles.availabilityCard, { backgroundColor: available ? AVAILABLE_BG : UNAVAILABLE_BG }]}>
            <View style={styles.availabilityLeft}>
              <View style={[styles.statusDot, { backgroundColor: '#FFF' }]} />
              <View>
                <AppText variant="title3" weight="bold" style={styles.statusTextWhite}>
                  {available ? t('providerReg.available') : t('providerReg.unavailable')}
                </AppText>
                <AppText variant="caption" style={styles.statusSubWhite}>
                  {available ? t('providerReg.statusSubOn') : t('providerReg.statusSubOff')}
                </AppText>
              </View>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.5)' }}
              thumbColor={available ? AVAILABLE_BG : '#9CA3AF'}
            />
          </View>

          {/* ——— 3. نوع المزود (Tabs) ——— */}
          <View style={[styles.card, { backgroundColor: CARD_BG, borderRadius: CARD_RADIUS }]}>
            <AppText variant="subhead" weight="semibold" style={[styles.cardTitle, { color: TEXT_PRIMARY }]}>
              نوع المزود
            </AppText>
            <View style={styles.tabsRow}>
              {PROVIDER_TYPES.map(({ role, key }) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.tab,
                    { backgroundColor: providerType === role ? HEADER_BG : INPUT_BG, borderColor: BORDER_COLOR },
                    providerType === role && styles.tabActive,
                  ]}
                  onPress={() => setProviderType(role)}
                  accessibilityRole="tab"
                >
                  <MaterialCommunityIcons
                    name={
                      role === ROLES.MECHANIC ? 'car-wrench' : role === ROLES.MECHANIC_TOW ? 'tow-truck' : 'car-multiple'
                    }
                    size={20}
                    color={providerType === role ? '#FFF' : TEXT_SECONDARY}
                  />
                  <AppText
                    variant="callout"
                    style={[styles.tabText, { color: providerType === role ? '#FFF' : TEXT_SECONDARY }]}
                  >
                    {t(`providerReg.${key}`)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ——— 4. حقول التسجيل الأساسية (مرتبة من الأعلى للأسفل) ——— */}
          <View style={[styles.card, { backgroundColor: CARD_BG, borderRadius: CARD_RADIUS }]}>
            <AppText variant="subhead" weight="semibold" style={[styles.cardTitle, { color: TEXT_PRIMARY }]}>
              البيانات الأساسية
            </AppText>
            <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
              <MaterialCommunityIcons name="account-outline" size={20} color={TEXT_SECONDARY} />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('providerReg.fullName')}
                placeholderTextColor={TEXT_SECONDARY}
                style={[styles.input, { color: TEXT_PRIMARY }]}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
              <MaterialCommunityIcons name="phone-outline" size={20} color={TEXT_SECONDARY} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder={t('providerReg.phone')}
                placeholderTextColor={TEXT_SECONDARY}
                style={[styles.input, { color: TEXT_PRIMARY }]}
                keyboardType="phone-pad"
              />
            </View>
            <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
              <MaterialCommunityIcons name="email-outline" size={20} color={TEXT_SECONDARY} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('providerReg.email')}
                placeholderTextColor={TEXT_SECONDARY}
                style={[styles.input, { color: TEXT_PRIMARY }]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={TEXT_SECONDARY} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('providerReg.password')}
                placeholderTextColor={TEXT_SECONDARY}
                style={[styles.input, { color: TEXT_PRIMARY }]}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={TEXT_SECONDARY}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.photoButton, { backgroundColor: INPUT_BG, borderColor: BORDER_COLOR }]} onPress={onAddPhoto}>
              <MaterialCommunityIcons name="camera-plus-outline" size={24} color={TEXT_SECONDARY} />
              <AppText variant="callout" style={{ color: TEXT_SECONDARY }}>{t('providerReg.addPhoto')}</AppText>
            </TouchableOpacity>
          </View>

          {/* ——— 5. حقول خاصة: ميكانيكي ——— */}
          {providerType === ROLES.MECHANIC && (
            <View style={[styles.card, { backgroundColor: CARD_BG, borderRadius: CARD_RADIUS }]}>
              <AppText variant="subhead" weight="semibold" style={[styles.cardTitle, { color: TEXT_PRIMARY }]}>
                بيانات الورشة
              </AppText>
              <View style={styles.addressRow}>
                <View style={[styles.inputWrap, { flex: 1, backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
                  <MaterialCommunityIcons name="map-marker-outline" size={20} color={TEXT_SECONDARY} />
                  <TextInput
                    value={workshopAddress}
                    onChangeText={setWorkshopAddress}
                    placeholder={t('providerReg.workshopAddress')}
                    placeholderTextColor={TEXT_SECONDARY}
                    style={[styles.input, { color: TEXT_PRIMARY }]}
                  />
                </View>
                <TouchableOpacity style={[styles.gpsButton, { backgroundColor: colors.primary }]} onPress={onGpsWorkshop}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#FFF" />
                  <AppText variant="caption" style={styles.gpsButtonText}>{t('providerReg.gpsButton')}</AppText>
                </TouchableOpacity>
              </View>
              <AppText variant="caption" style={[styles.checkboxSectionLabel, { color: TEXT_SECONDARY }]}>
                {t('providerReg.serviceTypes')}
              </AppText>
              {MECHANIC_SERVICES.map(({ id, key }) => (
                <CheckboxRow
                  key={id}
                  label={t(`providerReg.${key}`)}
                  checked={selectedServices.has(id)}
                  onPress={() => toggleService(id)}
                />
              ))}
              <View style={styles.timeRow}>
                <View style={[styles.inputWrap, { flex: 1, backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={TEXT_SECONDARY} />
                  <TextInput
                    value={workingHoursFrom}
                    onChangeText={setWorkingHoursFrom}
                    placeholder={t('providerReg.workingHoursFrom')}
                    placeholderTextColor={TEXT_SECONDARY}
                    style={[styles.input, { color: TEXT_PRIMARY }]}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                <AppText variant="body" style={{ color: TEXT_SECONDARY, marginHorizontal: 8 }}>–</AppText>
                <View style={[styles.inputWrap, { flex: 1, backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
                  <TextInput
                    value={workingHoursTo}
                    onChangeText={setWorkingHoursTo}
                    placeholder={t('providerReg.workingHoursTo')}
                    placeholderTextColor={TEXT_SECONDARY}
                    style={[styles.input, { color: TEXT_PRIMARY }]}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
            </View>
          )}

          {/* ——— 6. حقول خاصة: ونش ——— */}
          {providerType === ROLES.MECHANIC_TOW && (
            <View style={[styles.card, { backgroundColor: CARD_BG, borderRadius: CARD_RADIUS }]}>
              <AppText variant="subhead" weight="semibold" style={[styles.cardTitle, { color: TEXT_PRIMARY }]}>
                بيانات الونش
              </AppText>
              <View style={styles.addressRow}>
                <View style={[styles.inputWrap, { flex: 1, backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={TEXT_SECONDARY} />
                  <TextInput
                    value={currentLocation}
                    onChangeText={setCurrentLocation}
                    placeholder={t('providerReg.currentLocation')}
                    placeholderTextColor={TEXT_SECONDARY}
                    style={[styles.input, { color: TEXT_PRIMARY }]}
                  />
                </View>
                <TouchableOpacity style={[styles.gpsButton, { backgroundColor: colors.primary }]} onPress={onGpsLocation}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#FFF" />
                  <AppText variant="caption" style={styles.gpsButtonText}>{t('providerReg.gpsButton')}</AppText>
                </TouchableOpacity>
              </View>
              <AppText variant="caption" style={[styles.checkboxSectionLabel, { color: TEXT_SECONDARY }]}>
                {t('providerReg.vehicleTypes')}
              </AppText>
              {TOW_VEHICLES.map(({ id, key }) => (
                <CheckboxRow
                  key={id}
                  label={t(`providerReg.${key}`)}
                  checked={selectedVehicleTypes.has(id)}
                  onPress={() => toggleVehicle(id)}
                />
              ))}
            </View>
          )}

          {/* ——— 7. حقول خاصة: مؤجر سيارات ——— */}
          {providerType === ROLES.CAR_RENTAL && (
            <View style={[styles.card, { backgroundColor: CARD_BG, borderRadius: CARD_RADIUS }]}>
              <AppText variant="subhead" weight="semibold" style={[styles.cardTitle, { color: TEXT_PRIMARY }]}>
                بيانات التأجير
              </AppText>
              <AppText variant="caption" style={[styles.checkboxSectionLabel, { color: TEXT_SECONDARY }]}>
                {t('providerReg.carTypes')}
              </AppText>
              {RENTAL_CAR_TYPES.map(({ id, key }) => (
                <CheckboxRow
                  key={id}
                  label={t(`providerReg.${key}`)}
                  checked={selectedCarTypes.has(id)}
                  onPress={() => toggleCarType(id)}
                />
              ))}
              <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
                <MaterialCommunityIcons name="counter" size={20} color={TEXT_SECONDARY} />
                <TextInput
                  value={carsCount}
                  onChangeText={setCarsCount}
                  placeholder={t('providerReg.carsCount')}
                  placeholderTextColor={TEXT_SECONDARY}
                  style={[styles.input, { color: TEXT_PRIMARY }]}
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
                <MaterialCommunityIcons name="cash" size={20} color={TEXT_SECONDARY} />
                <TextInput
                  value={rentPerHour}
                  onChangeText={setRentPerHour}
                  placeholder={t('providerReg.rentPerHour')}
                  placeholderTextColor={TEXT_SECONDARY}
                  style={[styles.input, { color: TEXT_PRIMARY }]}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
                <MaterialCommunityIcons name="cash-multiple" size={20} color={TEXT_SECONDARY} />
                <TextInput
                  value={rentPerDay}
                  onChangeText={setRentPerDay}
                  placeholder={t('providerReg.rentPerDay')}
                  placeholderTextColor={TEXT_SECONDARY}
                  style={[styles.input, { color: TEXT_PRIMARY }]}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          )}

          {/* ——— 7b. حقول خاصة: مزود تأمين ——— */}
          {providerType === ROLES.INSURANCE && (
            <View style={[styles.card, { backgroundColor: CARD_BG, borderRadius: CARD_RADIUS }]}>
              <AppText variant="subhead" weight="semibold" style={[styles.cardTitle, { color: TEXT_PRIMARY }]}>
                {t('providerReg.insuranceOfficeTitle')}
              </AppText>
              <View style={styles.addressRow}>
                <View style={[styles.inputWrap, { flex: 1, backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
                  <MaterialCommunityIcons name="map-marker-outline" size={20} color={TEXT_SECONDARY} />
                  <TextInput
                    value={workshopAddress}
                    onChangeText={setWorkshopAddress}
                    placeholder={t('providerReg.workshopAddress')}
                    placeholderTextColor={TEXT_SECONDARY}
                    style={[styles.input, { color: TEXT_PRIMARY }]}
                  />
                </View>
                <TouchableOpacity style={[styles.gpsButton, { backgroundColor: colors.primary }]} onPress={onGpsWorkshop}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#FFF" />
                  <AppText variant="caption" style={styles.gpsButtonText}>{t('providerReg.gpsButton')}</AppText>
                </TouchableOpacity>
              </View>
              <View style={styles.timeRow}>
                <View style={[styles.inputWrap, { flex: 1, backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={TEXT_SECONDARY} />
                  <TextInput
                    value={workingHoursFrom}
                    onChangeText={setWorkingHoursFrom}
                    placeholder={t('providerReg.workingHoursFrom')}
                    placeholderTextColor={TEXT_SECONDARY}
                    style={[styles.input, { color: TEXT_PRIMARY }]}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                <AppText variant="body" style={{ color: TEXT_SECONDARY, marginHorizontal: 8 }}>–</AppText>
                <View style={[styles.inputWrap, { flex: 1, backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, minHeight: INPUT_HEIGHT }]}>
                  <TextInput
                    value={workingHoursTo}
                    onChangeText={setWorkingHoursTo}
                    placeholder={t('providerReg.workingHoursTo')}
                    placeholderTextColor={TEXT_SECONDARY}
                    style={[styles.input, { color: TEXT_PRIMARY }]}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
            </View>
          )}

          {/* ——— 8. استقبال الطلبات: تلقائي / موافقة يدوية ——— */}
          <View style={[styles.card, { backgroundColor: CARD_BG, borderRadius: CARD_RADIUS }]}>
            <AppText variant="subhead" weight="semibold" style={[styles.cardTitle, { color: TEXT_PRIMARY }]}>
              {t('providerReg.requestMode')}
            </AppText>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeChip, { backgroundColor: !autoAccept ? HEADER_BG : INPUT_BG, borderColor: BORDER_COLOR }]}
                onPress={() => setAutoAccept(false)}
              >
                <MaterialCommunityIcons name="hand-back-right-outline" size={20} color={!autoAccept ? '#FFF' : TEXT_SECONDARY} />
                <AppText variant="callout" style={{ color: !autoAccept ? '#FFF' : TEXT_SECONDARY }}>{t('providerReg.manualAccept')}</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeChip, { backgroundColor: autoAccept ? HEADER_BG : INPUT_BG, borderColor: BORDER_COLOR }]}
                onPress={() => setAutoAccept(true)}
              >
                <MaterialCommunityIcons name="robot-outline" size={20} color={autoAccept ? '#FFF' : TEXT_SECONDARY} />
                <AppText variant="callout" style={{ color: autoAccept ? '#FFF' : TEXT_SECONDARY }}>{t('providerReg.autoAccept')}</AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* ——— 9. قائمة الطلبات الواردة (بطاقات + خريطة مصغرة + قبول/رفض) ——— */}
          <View style={[styles.card, { backgroundColor: CARD_BG, borderRadius: CARD_RADIUS }]}>
            <View style={styles.requestsHeader}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={22} color={TEXT_PRIMARY} />
              <AppText variant="subhead" weight="semibold" style={[styles.cardTitle, { color: TEXT_PRIMARY }]}>
                {t('providerReg.currentRequests')}
              </AppText>
            </View>
            {MOCK_REQUESTS.map((req) => (
              <View key={req.id} style={[styles.requestCard, { borderColor: BORDER_COLOR }]}>
                <View style={[styles.miniMap, { height: MINI_MAP_HEIGHT, backgroundColor: BORDER_COLOR }]}>
                  <MaterialCommunityIcons name="map-marker" size={32} color={colors.primary} />
                  <AppText variant="caption" style={{ color: TEXT_SECONDARY }} numberOfLines={1}>{req.address}</AppText>
                </View>
                <View style={styles.requestBody}>
                  <AppText variant="body" weight="semibold" style={{ color: TEXT_PRIMARY }} numberOfLines={1}>{req.customerName}</AppText>
                  <AppText variant="caption" style={{ color: TEXT_SECONDARY }}>{req.serviceType} · {req.timeAgo}</AppText>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity style={[styles.requestBtn, { backgroundColor: ACCEPT_BTN_BG }]} onPress={() => handleAccept(req.id)} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="check" size={22} color="#FFF" />
                    <AppText variant="callout" weight="semibold" style={styles.requestBtnText}>{t('providerReg.accept')}</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.requestBtn, { backgroundColor: DECLINE_BTN_BG }]} onPress={() => handleDecline(req.id)} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="close" size={22} color="#FFF" />
                    <AppText variant="callout" weight="semibold" style={styles.requestBtnText}>{t('providerReg.decline')}</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* ——— 10. إشعارات ——— */}
          <View style={[styles.notifBanner, { backgroundColor: colors.infoLight, borderColor: 'rgba(2,132,199,0.2)' }]}>
            <MaterialCommunityIcons name="bell-ring-outline" size={24} color={colors.primary} />
            <View style={styles.notifTextWrap}>
              <AppText variant="callout" weight="semibold" style={{ color: TEXT_PRIMARY }}>{t('providerReg.notifications')}</AppText>
              <AppText variant="caption" style={{ color: TEXT_SECONDARY }}>{t('providerReg.notificationsHint')}</AppText>
            </View>
          </View>

          {error ? <AppText variant="callout" style={[styles.errorText, { color: colors.error }]}>{error}</AppText> : null}

          <Button
            title={t('providerReg.submit')}
            onPress={onSubmit}
            disabled={!fullName.trim() || !phone.trim() || !email.trim() || !password}
            fullWidth
            size="lg"
            style={styles.submitBtn}
          />
          <View style={{ height: spacing.xl * 2 }} />
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 16,
    minHeight: 56,
  },
  headerBack: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {},
  headerRight: { width: 44, height: 44 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  keyboardWrap: { flexGrow: 1 },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: CARD_RADIUS,
    marginBottom: 16,
    ...shadows.md,
  },
  availabilityLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusTextWhite: { color: '#FFF', fontSize: 18 },
  statusSubWhite: { color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  card: {
    padding: 20,
    marginBottom: 16,
    ...shadows.sm,
  },
  cardTitle: { marginBottom: 16 },
  tabsRow: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabActive: {},
  tabText: {},
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  input: { flex: 1, marginLeft: 12, fontFamily: typography.fontFamily.regular, fontSize: 16, paddingVertical: 12 },
  eyeBtn: { padding: 8 },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  gpsButton: { paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minWidth: 100 },
  gpsButtonText: { color: '#FFF' },
  checkboxSectionLabel: { marginBottom: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  requestsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  requestCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  miniMap: { justifyContent: 'center', alignItems: 'center', gap: 4 },
  requestBody: { paddingHorizontal: 16, paddingVertical: 12 },
  requestActions: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  requestBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  requestBtnText: { color: '#FFF' },
  notifBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  notifTextWrap: { flex: 1 },
  errorText: { marginBottom: 12 },
  submitBtn: { marginTop: 8 },
});
