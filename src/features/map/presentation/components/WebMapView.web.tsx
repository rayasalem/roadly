/**
 * Web: uses OSMMapView.web (Leaflet from npm bundle = same-origin, no Tracking Prevention).
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { Provider } from '../../../providers/domain/types';
import { OSMMapView } from './OSMMapView.web';

export interface WebMapViewProps {
  center: { latitude: number; longitude: number };
  providers: Provider[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedProviderId: string | null;
  nearestProviderId?: string | null;
  onProviderPress: (provider: Provider) => void;
  /** نفس منطق Native: الانتقال إلى RequestScreen */
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
