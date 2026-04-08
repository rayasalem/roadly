/**
 * Web-only: OpenStreetMap (مجاني، بدون Google Maps).
 * خريطة تفاعلية مع Markers (صورة، اسم، رقم) وترتيب الأقرب.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { Provider } from '../../../providers/domain/types';
import { OSMMapView } from './OSMMapView';

export interface WebMapViewProps {
  center: { latitude: number; longitude: number };
  providers: Provider[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedProviderId: string | null;
  /** Closest provider id — marker gets pulse animation */
  nearestProviderId?: string | null;
  onProviderPress: (provider: Provider) => void;
  onRequestService?: (provider: Provider) => void;
}

export function WebMapView(props: WebMapViewProps) {
  return (
    <View style={styles.container}>
      <OSMMapView
        center={props.center}
        providers={props.providers}
        userLocation={props.userLocation}
        selectedProviderId={props.selectedProviderId}
        nearestProviderId={props.nearestProviderId}
        onProviderPress={props.onProviderPress}
        onRequestService={props.onRequestService}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: 280,
  },
});
