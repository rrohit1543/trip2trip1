'use client';

import React from 'react';
import { Trip, LiveTelemetry } from '../../types';
import GoogleMapComponent from './GoogleMapComponent';

interface Props {
  trip: Trip;
  telemetry?: LiveTelemetry;
  height?: string;
}

export default function LiveTripMap({ trip, telemetry, height = '450px' }: Props) {
  return (
    <GoogleMapComponent
      selectedTrip={trip}
      telemetry={telemetry}
      height={height}
    />
  );
}
