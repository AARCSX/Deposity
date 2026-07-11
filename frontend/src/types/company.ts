export interface CompanyRecord {
  id?: string;
  name: string;
  logo: string;
  status: "Premium Partner" | "Standard Account" | "Critical: Payment Overdue" | "Overdue";
  location: string;
  contactPerson: string;
  phone: string;
  email?: string;
  totalValue: number;
  isPaid: boolean;
  pendingAmount: number;
  industry?: string;
}
