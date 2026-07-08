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

export interface ComplianceDocuments {
  rcExpiry: string;
  insuranceExpiry: string;
  pucExpiry: string;
  fitnessExpiry: string;
  permitDetails: string;
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
