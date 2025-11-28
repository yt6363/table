import { PlanetPosition, ActiveSector, PlanetaryResponse, PlanetDignity } from "../types";
import { AyanamsaType } from "../contexts/AyanamsaContext";

// --- Mappings provided by user ---

const PLANET_SECTORS: Record<string, string[]> = {
  "Sun": ["Public Sector Enterprises", "PSU Banks", "Precious Stones", "Gilt Edged Securities", "Rice", "Honey", "Aromatic Herbs", "Gold"],
  "Moon": ["Silver", "Milk Products", "Petroleum Shares", "Hotel", "Liquids", "Liquor", "Fishery", "Shipping", "Glass"],
  "Mars": ["Healthcare", "Pharma", "Iron & Steel", "Engineering", "Defense", "Railways", "Brick Mfg", "Tea/Coffee", "Automobiles"],
  "Mercury": ["Sentiments", "Grains", "Textiles (Silk/Cotton)", "Sugar", "Telecom", "Aviation", "Banking", "FMCG", "IT"],
  "Venus": ["Cotton/Jute", "Fancy Textiles", "Premium Grains", "Confectionery", "Gems/Pearls", "Floriculture", "Media", "Perfumes", "Spices"],
  "Jupiter": ["Turmeric", "Tin", "Rubber", "Foodstuff", "Zinc", "Tobacco", "Share Trading", "Banking", "Legal", "Luxury Trade"],
  "Saturn": ["Coal", "Lead", "Cement", "Leather", "Mining", "Farming", "Real Estate", "Metallurgy", "Vegetables", "Automobiles"],
  "Rahu": ["Media & Ent", "Telecom", "IT", "Electrical Goods", "Crude Oil", "Pharmaceuticals"],
  "Ketu": ["Coal", "IT", "Oil & Gas", "Leather", "Power", "Infrastructure", "Automobile", "Copper"],
  "Uranus": ["Electrical Goods", "Aviation", "Surgical Goods", "Wireless/Telegraph", "Railways", "Govt Paper", "Film Industry", "Aluminium"],
  "Neptune": ["Raw Tea", "Raw Cotton", "Medicine/Drugs", "Oil Industry", "Fishing", "Tobacco", "Market Syndicates"],
  "Pluto": ["Robbery/Theft", "Tin", "Copper", "Zinc", "Watches", "High-Quality Machinery", "Rubber", "Leather Shares"]
};

const SIGN_SECTORS: Record<string, string[]> = {
  "Aries": ["Gold", "Woollen Blankets", "Wheat", "Nickel", "Copper", "Iron Ore", "Steel", "Machinery"],
  "Taurus": ["Cotton", "Jute", "White Cloth", "Metals", "Equities", "Rice", "Sugar", "Banking", "Liquidity"],
  "Gemini": ["Railway", "Publications", "Paper Industries"],
  "Cancer": ["Silver", "Tea", "Fixed Assets"],
  "Leo": ["Gold", "Currency", "Leather"],
  "Virgo": ["Vegetables", "Healthy Pulses"],
  "Libra": ["Silk", "Coloured Cloths"],
  "Scorpio": ["Chemicals", "Jaggery", "Sugar", "Steel", "Leather", "Wool"],
  "Sagittarius": ["Salt", "Shares", "Rubber", "Defense", "Shipping", "Foreign Bonds", "Insurance"],
  "Capricorn": ["Gold", "Copper", "Coal", "Textile Shares", "Steel/Iron", "Glass", "Zinc"],
  "Aquarius": ["Electrical Goods", "Paints", "Wooden Furniture", "Coal Shares", "Oil", "Cars/Trucks", "Telecom", "Agriculture Mach."],
  "Pisces": ["Fishing", "Wax", "Perfumes", "Diamonds", "Pearls", "Pharma"]
};

const NAKSHATRA_COMMODITIES: Record<string, string[]> = {
  "Ashwini": ["Rice", "Wool", "Iron", "Copper"],
  "Bharani": ["Wheat", "Rice", "Chillies", "Edible Oils"],
  "Krittika": ["Rice", "Sesame", "Barley", "Oilseeds", "Oil", "Gold", "Silver"],
  "Rohini": ["Cotton Cloth", "Silver", "Gold", "Silver"],
  "Mrigashira": ["Food Grains", "Pulses"],
  "Ardra": ["Oils"],
  "Punarvasu": ["Gold", "Cotton", "Millets"],
  "Pushya": ["Gold", "Silver", "Edible Oils"],
  "Ashlesha": ["Wheat", "Sugar", "Ginger", "Chillies"],
  "Magha": ["Oils", "Sugar"],
  "Purva Phalguni": ["Cotton", "Wool", "Gold", "Silver", "Oil", "Silver"],
  "Uttara Phalguni": ["Rice", "Grains", "Pulses"],
  "Hasta": ["Cotton", "Silver"],
  "Chitra": ["Gold", "Pulses"],
  "Swati": ["Mustard Oil", "Chillies", "Oil"],
  "Vishakha": ["Wheat", "Rice", "Barley", "Pulses"],
  "Anuradha": ["Rice", "Gram", "Sugar"],
  "Jyeshtha": ["Silver", "Bronze", "Oils"],
  "Mula": ["Wheat", "Salt", "Raw Cotton"],
  "Purva Ashadha": ["Rice", "Cotton"],
  "Uttara Ashadha": ["Iron", "Metals"],
  "Shravana": ["Black Pepper", "Silver"],
  "Dhanishta": ["Wheat", "Gold", "Gold", "Silver"],
  "Shatabhisha": ["Oils", "Silver"],
  "Purva Bhadrapada": ["Metals", "Gold"],
  "Uttara Bhadrapada": ["Sugar", "Rice"],
  "Revati": ["Precious Stones", "Betel Nuts"]
};

const DIGNITY_RULES: Record<string, DignityRule> = {
  "Sun": { exaltation: "Aries", own: ["Leo"], debilitation: "Libra" },
  "Moon": { exaltation: "Taurus", own: ["Cancer"], debilitation: "Scorpio" },
  "Mars": { exaltation: "Capricorn", own: ["Aries", "Scorpio"], debilitation: "Cancer" },
  "Mercury": { exaltation: "Virgo", own: ["Gemini", "Virgo"], debilitation: "Pisces" },
  "Jupiter": { exaltation: "Cancer", own: ["Sagittarius", "Pisces"], debilitation: "Capricorn" },
  "Venus": { exaltation: "Pisces", own: ["Taurus", "Libra"], debilitation: "Virgo" },
  "Saturn": { exaltation: "Libra", own: ["Capricorn", "Aquarius"], debilitation: "Aries" },
  "Rahu": { exaltation: "Taurus", own: ["Aquarius"], debilitation: "" },
  "Ketu": { exaltation: "Scorpio", own: ["Scorpio"], debilitation: "" },
  "Uranus": { exaltation: "", own: ["Aquarius"], debilitation: "" },
  "Neptune": { exaltation: "", own: ["Pisces"], debilitation: "" },
  "Pluto": { exaltation: "", own: ["Scorpio"], debilitation: "" }
};

interface DignityRule {
  exaltation: string;
  own: string[];
  debilitation: string;
}

// Aspect Rules (Drishti)
const PLANET_ASPECTS: Record<string, number[]> = {
  "Mars": [4, 7, 8],
  "Jupiter": [5, 7, 9],
  "Saturn": [3, 7, 10],
  "Rahu": [5, 7, 9],
  "Ketu": [5, 7, 9],
  "Sun": [7],
  "Moon": [7],
  "Mercury": [7],
  "Venus": [7],
  "Uranus": [7], 
  "Neptune": [7],
  "Pluto": [7]
};

// --- Utilities ---

const PLANET_NAMES = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Uranus", "Neptune", "Pluto"];
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

// Complete list of 27 Nakshatras and their Lords
const NAKSHATRA_DATA: {name: string, lord: string}[] = [
  { name: "Ashwini", lord: "Ketu" },
  { name: "Bharani", lord: "Venus" },
  { name: "Krittika", lord: "Sun" },
  { name: "Rohini", lord: "Moon" },
  { name: "Mrigashira", lord: "Mars" },
  { name: "Ardra", lord: "Rahu" },
  { name: "Punarvasu", lord: "Jupiter" },
  { name: "Pushya", lord: "Saturn" },
  { name: "Ashlesha", lord: "Mercury" },
  { name: "Magha", lord: "Ketu" },
  { name: "Purva Phalguni", lord: "Venus" },
  { name: "Uttara Phalguni", lord: "Sun" },
  { name: "Hasta", lord: "Moon" },
  { name: "Chitra", lord: "Mars" },
  { name: "Swati", lord: "Rahu" },
  { name: "Vishakha", lord: "Jupiter" },
  { name: "Anuradha", lord: "Saturn" },
  { name: "Jyeshtha", lord: "Mercury" },
  { name: "Mula", lord: "Ketu" },
  { name: "Purva Ashadha", lord: "Venus" },
  { name: "Uttara Ashadha", lord: "Sun" },
  { name: "Shravana", lord: "Moon" },
  { name: "Dhanishta", lord: "Mars" },
  { name: "Shatabhisha", lord: "Rahu" },
  { name: "Purva Bhadrapada", lord: "Jupiter" },
  { name: "Uttara Bhadrapada", lord: "Saturn" },
  { name: "Revati", lord: "Mercury" }
];

let cache: Record<string, PlanetaryResponse> = {};

export const getSectorsForPlanet = (planetName: string) => PLANET_SECTORS[planetName] || [];
export const getSectorsForSign = (signName: string) => SIGN_SECTORS[signName] || [];

export const getOwnedSigns = (planet: string) => DIGNITY_RULES[planet]?.own || [];

export const getAspectedSigns = (planet: string, currentSign: string): string[] => {
    const aspects = PLANET_ASPECTS[planet] || [7];
    const signIndex = SIGNS.indexOf(currentSign);
    if (signIndex === -1) return [];
    
    return aspects.map(aspect => {
        // -1 because if I am in 1st house and aspect 7th house, I move 6 places. (1 + 7 - 1)
        const targetIndex = (signIndex + aspect - 1) % 12;
        return SIGNS[targetIndex];
    });
};

const getDignity = (planet: string, sign: string): PlanetDignity => {
  const rule = DIGNITY_RULES[planet];
  if (!rule) return 'n/a';

  if (rule.exaltation === sign) return 'exalted';
  if (rule.debilitation === sign) return 'debilitated';
  if (rule.own.includes(sign)) return 'own_sign';
  
  return 'neutral';
};

export const fetchPlanetaryData = async (
  lat: number,
  long: number,
  timezone: string,
  date: string,
  ayanamsa: AyanamsaType
): Promise<PlanetaryResponse> => {
  const key = `${lat}-${long}-${date}-${ayanamsa}`;
  
  // Simulate network delay for effect
  await new Promise(resolve => setTimeout(resolve, 600));

  if (cache[key]) {
    return cache[key];
  }

  // Generate deterministic mock data based on inputs
  const mockPlanets: PlanetPosition[] = PLANET_NAMES.map((name, i) => {
      // Create variation based on date string hash to make it look stable per date
      const dateHash = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const offset = dateHash + (i * 55); 
      
      const totalDegrees = (offset * 13.3) % 360;
      const signIndex = Math.floor(totalDegrees / 30);
      const degreeInSign = totalDegrees % 30;
      const sign = SIGNS[signIndex];

      // Nakshatra Calculation (approximate for mock)
      // Each nakshatra is 13deg 20min = 13.333 degrees
      const nakshatraIndex = Math.floor(totalDegrees / 13.333333) % 27;
      const nakshatraInfo = NAKSHATRA_DATA[nakshatraIndex];
      
      return {
        name,
        longitude: totalDegrees,
        longitudeInSign: degreeInSign,
        sign: sign,
        speed: (Math.random() * 1.5) - 0.2, // Mock speed
        retrograde: ["Rahu", "Ketu"].includes(name) ? true : Math.random() > 0.8,
        nakshatra: nakshatraInfo.name,
        nakshatraLord: nakshatraInfo.lord,
        pada: Math.floor(Math.random() * 4) + 1,
        dignity: getDignity(name === "Herschel" ? "Uranus" : name, sign),
        commodities: NAKSHATRA_COMMODITIES[nakshatraInfo.name] || []
      };
  });

  // Calculate Active Sectors based on Planet + Sign logic
  const activeSectors: ActiveSector[] = mockPlanets.map(p => {
    const planetSectors = PLANET_SECTORS[p.name === "Herschel" ? "Uranus" : p.name] || [];
    const signSectors = SIGN_SECTORS[p.sign] || [];
    
    // Combine sectors (Union) for the Active Sector summary
    const combinedSectors = Array.from(new Set([...planetSectors, ...signSectors]));

    // Calculate intensity
    let intensity = 3;
    if (p.dignity === 'exalted' || p.dignity === 'own_sign') intensity += 1;
    if (p.dignity === 'debilitated') intensity -= 1;
    if (p.retrograde) intensity += 1;

    return {
      planet: p.name,
      sign: p.sign,
      degreeInSign: p.longitudeInSign,
      focusIntensity: Math.min(5, Math.max(1, intensity)),
      industries: combinedSectors.slice(0, 8) 
    };
  }).sort((a, b) => b.focusIntensity - a.focusIntensity);

  const response = {
    planets: mockPlanets,
    activeSectors: activeSectors
  };

  cache[key] = response;
  return response;
};

export const clearCache = () => {
  cache = {};
};

export const getCacheStats = () => {
  return {
    validEntries: Object.keys(cache).length
  };
};

export const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  }).format(date);
};