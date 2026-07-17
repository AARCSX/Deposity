export interface RouteDetails {
  originName: string;
  originDate: string;
  destinationName: string;
  destinationDate: string;
  isEstimated: boolean;
}

export interface CargoDetails {
  material: string;
  weight: number;
  ratePerTon: number;
  company: string;
}

export interface AssignmentDetails {
  vehicleId: string;
  driverId: string;
}

export interface FinancialsDetails {
  totalFreight: number;
  advancePaid: number;
}

export interface TripRecord {
  id?: string;
  status: "pending" | "in-transit" | "delivered";
  route: RouteDetails;
  cargo: CargoDetails;
  assignment: AssignmentDetails;
  financials: FinancialsDetails;
}
