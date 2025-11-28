export interface Location {
  latitude: number;
  longitude: number;
  timezone: string;
  name: string;
}

export type PlanetDignity = 'exalted' | 'own_sign' | 'debilitated' | 'neutral' | 'n/a';

export interface PlanetPosition {
  name: string;
  longitude: number;
  longitudeInSign: number;
  sign: string;
  speed: number;
  retrograde: boolean;
  nakshatra?: string;
  nakshatraLord?: string; // Ruling planet of the nakshatra
  pada?: number;
  dignity: PlanetDignity;
  commodities: string[]; // Specific commodities based on Nakshatra
}

export interface ActiveSector {
  planet: string;
  sign: string;
  degreeInSign: number;
  focusIntensity: number; // 1-5, calculated based on planetary strength
  industries: string[]; // List of specific industries in focus
}

export interface PlanetaryResponse {
  planets: PlanetPosition[];
  activeSectors: ActiveSector[];
}