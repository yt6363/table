import { PlanetPosition, ActiveSector, PlanetaryResponse } from "../types";
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

// --- Utilities ---

const PLANET_NAMES = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Uranus", "Neptune", "Pluto"];
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni"];

let cache: Record<string, PlanetaryResponse> = {};

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
  // In a real app, this would call a swisseph library or external API
  const mockPlanets: PlanetPosition[] = PLANET_NAMES.map((name, i) => {
      // Create variation based on date string hash to make it look stable per date
      const dateHash = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const offset = dateHash + (i * 55); 
      
      const totalDegrees = (offset * 13.3) % 360;
      const signIndex = Math.floor(totalDegrees / 30);
      const degreeInSign = totalDegrees % 30;
      
      return {
        name,
        longitude: totalDegrees,
        longitudeInSign: degreeInSign,
        sign: SIGNS[signIndex],
        speed: (Math.random() * 1.5) - 0.2, // Mock speed
        retrograde: ["Rahu", "Ketu"].includes(name) ? true : Math.random() > 0.8,
        nakshatra: NAKSHATRAS[Math.floor(totalDegrees / 13.33) % NAKSHATRAS.length],
        pada: Math.floor(Math.random() * 4) + 1
      };
  });

  // Calculate Active Sectors based on Planet + Sign logic
  const activeSectors: ActiveSector[] = mockPlanets.map(p => {
    const planetSectors = PLANET_SECTORS[p.name === "Herschel" ? "Uranus" : p.name] || [];
    const signSectors = SIGN_SECTORS[p.sign] || [];
    
    // Combine sectors (Union)
    const combinedSectors = Array.from(new Set([...planetSectors, ...signSectors]));

    // Calculate intensity (Mock logic: Exalted planets or slow movers get higher intensity)
    let intensity = 3;
    if (["Saturn", "Jupiter", "Rahu"].includes(p.name)) intensity += 1;
    if (p.retrograde) intensity += 1;
    if (Math.random() > 0.8) intensity = Math.max(1, intensity - 1); // Random flux

    return {
      planet: p.name,
      sign: p.sign,
      degreeInSign: p.longitudeInSign,
      focusIntensity: Math.min(5, intensity),
      industries: combinedSectors.slice(0, 8) // Limit to top 8 for UI cleanliness
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