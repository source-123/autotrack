export type Currency = "EUR" | "USD" | "DZD" | "MAD" | "TND" | "GBP" | "CHF" | "CAD";

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin?: string;
  mileage: number;
  fuel: "essence" | "diesel" | "electrique" | "hybride" | "gpl";
  photoUri?: string;
  createdAt: string;
};

export type MaintenanceType =
  | "vidange"
  | "filtre_air"
  | "filtre_huile"
  | "bougies"
  | "plaquettes"
  | "pneus"
  | "batterie"
  | "courroie"
  | "chaine"
  | "autre";

export type Maintenance = {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  date: string;
  mileage: number;
  cost: number;
  garage?: string;
  notes?: string;
  nextDueDate?: string;
  nextDueMileage?: number;
  createdAt: string;
};

export type Insurance = {
  id: string;
  vehicleId: string;
  company: string;
  policyNumber: string;
  type: "tous_risques" | "tiers" | "intermediaire";
  startDate: string;
  endDate: string;
  cost: number;
  notes?: string;
};

export type Inspection = {
  id: string;
  vehicleId: string;
  date: string;
  expiryDate: string;
  result: "pass" | "fail";
  cost: number;
  center?: string;
  notes?: string;
};

export type Reminder = {
  id: string;
  vehicleId: string;
  title: string;
  dueDate?: string;
  dueMileage?: number;
  type: "inspection" | "insurance" | "maintenance" | "custom";
  notified: boolean;
};
