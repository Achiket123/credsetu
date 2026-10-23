import { Loan, Summary } from '../types';

export function isOverdue(load: Loan) : boolean {
  if (load.repaid) return false;
  else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(load.dueDate) < today;
    }
}

export function getSummary(loans: Loan[]): Summary{
  const totalLent = loans.reduce((s, l) => s + l.amount, 0);
  const totalRepaid = loans.filter(l => l.repaid).reduce((s, l) => s + l.amount, 0);
  const overdueAmount = loans.filter(isOverdue).reduce((s, l) => s + l.amount, 0);
  return {
    totalLent,
    totalRepaid,
    overdueAmount,
    outstanding: totalLent - totalRepaid
  };
}
