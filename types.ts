export enum Category {
  FOOD = 'Food',
  DRINK = 'Drink',
  ALL = 'All'
}

export interface Place {
  id: string;
  name: string;
  category: Category;
  rating: number;
  isOpen: boolean;
  address: string;
  distance?: string; // Distance string (e.g., "0.5 km")
  sourceUri?: string; // URL from Google Maps grounding
}

export interface GeoLocation {
  lat: number;
  lng: number;
}