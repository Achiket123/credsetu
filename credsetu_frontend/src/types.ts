export type Loan = {
  id: string;
  amount: number;
  friendName: string;
  dueDate: string;
  repaid: boolean;
  receiptUrl?: string;
  createdAt: string;
}
export type Summary = {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
  outstanding: number;

}
