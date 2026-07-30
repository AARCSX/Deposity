export interface ExpenseRecord {
  id?: string;
  category: "Salary" | "EMI" | "Fuel & Fleet" | "Office & Misc" | string;
  title: string;
  amount: number;
  expenseDate: string;
  recipientType?: string;
  recipientId?: string;
  recipientName?: string;
  vehicleId?: string;
  vehicleNumber?: string;
  paymentMode?: string;
  notes?: string;
  createdAt?: string;
}

export interface VehicleEMISummary {
  vehicleId: string;
  vehicleNumber: string;
  totalLoanAmount: number;
  totalPaid: number;
  remainingAmount: number;
  monthlyEmi: number;
  totalInstallments: number;
  paidInstallments: number;
  financingBank?: string;
  nextDueDate?: string;
}
