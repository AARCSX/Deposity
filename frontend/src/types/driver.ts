export interface DriverRecord {
  id?: string;
  name: string;
  avatar?: string;
  status: string; // "Active" | "Inactive" | "On Break"
  phone: string;
  vehicle?: string; // registration number
  vehicleId?: string | null;
  licenseNumber: string;
  licenseExpiry: string;
  licenseIssuance?: string;
  salary: string | number;
  pendingBalance: string | number;
  isStatusWarning?: boolean;
}
