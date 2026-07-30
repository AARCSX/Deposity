export interface EmployeeRecord {
  id?: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  joiningDate: string;
  baseSalary: number;
  pendingBalance: number;
  status: "Active" | "On Leave" | "Inactive" | string;
  avatar?: string;
}

export interface SalaryPaymentRecord {
  id: string;
  recipientType: "driver" | "employee" | string;
  recipientId: string;
  amountPaid: number;
  pendingBalance: number;
  paymentMode: string;
  notes?: string;
  paymentDate: string;
}
