'use client';

import React from 'react';
import { Trip, LiveTelemetry } from '../../types';
import GoogleMapComponent from './GoogleMapComponent';

interface Props {
  trips: Trip[];
  telemetry: Record<string, LiveTelemetry>;
  height?: string;
  onSelectTrip?: (trip: Trip) => void;
}

export default function GlobalFleetMap({ trips, telemetry, height = '560px', onSelectTrip }: Props) {
  return (
    <GoogleMapComponent
      trips={trips}
      allTelemetry={telemetry}
      height={height}
      onSelectTrip={onSelectTrip}
    />
  );
}
