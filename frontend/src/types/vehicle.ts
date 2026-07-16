export interface CoreSpecifications {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  bodyType: string;
  axleConfig: string;
  tonnageCapacity: number;
  fuelCapacity: number;
  averageMileage: number;
}

export interface PermitState {
  name: string;
  issuance: string;
  expiry: string;
}

export interface PermitData {
  type: "National" | "State";
  issuance: string;
  expiry: string;
  states: PermitState[];
}

export interface ComplianceDocuments {
  rcExpiry: string;
  rcIssuance?: string;
  insuranceExpiry: string;
  insuranceIssuance?: string;
  pucExpiry: string;
  pucIssuance?: string;
  fitnessExpiry: string;
  fitnessIssuance?: string;
  permitDetails: string; // JSON-serialized PermitData
}

export interface OwnershipStatus {
  ownershipType: "Own" | "Market";
  driverId: string;
  homeBranch: string;
  gpsDeviceId: string;
}

export interface MaintenanceData {
  currentOdometer: number;
  lastServicedDate: string;
}

export interface VehicleRecord {
  id?: string;
  core: CoreSpecifications;
  compliance: ComplianceDocuments;
  ownership: OwnershipStatus;
  maintenance: MaintenanceData;
  status: "all-good" | "expiring-soon" | "expired-docs" | "maintenance";
}

// ─── Permit Helpers ──────────────────────────────────────────────

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const DEFAULT_PERMIT_DATA: PermitData = {
  type: "National",
  issuance: "",
  expiry: "",
  states: [],
};

export function parsePermitDetails(raw: string): PermitData {
  if (!raw || raw.trim() === "") return { ...DEFAULT_PERMIT_DATA };
  try {
    const parsed = JSON.parse(raw);
    return {
      type: parsed.type === "State" ? "State" : "National",
      issuance: parsed.issuance || "",
      expiry: parsed.expiry || "",
      states: Array.isArray(parsed.states) ? parsed.states : [],
    };
  } catch {
    // Legacy plain-text value — treat as national permit note
    return { ...DEFAULT_PERMIT_DATA };
  }
}

export function serializePermitDetails(permit: PermitData): string {
  return JSON.stringify(permit);
}
