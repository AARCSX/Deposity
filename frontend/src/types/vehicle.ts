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
  hasNational: boolean;
  nationalIssuance: string;
  nationalExpiry: string;
  hasState: boolean;
  statePermits: PermitState[];
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
  driverName?: string;
  driverPhone?: string;
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
  hasNational: false,
  nationalIssuance: "",
  nationalExpiry: "",
  hasState: false,
  statePermits: [],
};

export function parsePermitDetails(raw: string): PermitData {
  if (!raw || raw.trim() === "") return { ...DEFAULT_PERMIT_DATA };
  try {
    const parsed = JSON.parse(raw);
    
    // Check if it is the old schema
    if (parsed.type === "National" || parsed.type === "State") {
      return {
        hasNational: parsed.type === "National",
        nationalIssuance: parsed.type === "National" ? parsed.issuance || "" : "",
        nationalExpiry: parsed.type === "National" ? parsed.expiry || "" : "",
        hasState: parsed.type === "State",
        statePermits: parsed.type === "State" ? (Array.isArray(parsed.states) ? parsed.states : []) : [],
      };
    }

    // New schema
    return {
      hasNational: !!parsed.hasNational,
      nationalIssuance: parsed.nationalIssuance || "",
      nationalExpiry: parsed.nationalExpiry || "",
      hasState: !!parsed.hasState,
      statePermits: Array.isArray(parsed.statePermits) ? parsed.statePermits : [],
    };
  } catch {
    // Legacy plain-text value
    return { ...DEFAULT_PERMIT_DATA };
  }
}

export function serializePermitDetails(permit: PermitData): string {
  return JSON.stringify(permit);
}
