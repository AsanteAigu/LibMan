export interface StudentDashboardStats {
  activeLoans: number;
  reservedBooks: number;
  overdueBooks: number;
  outstandingCharges: number;
}

export interface LibrarianDashboardStats {
  pendingRequests: number;
  activeLoans: number;
  returnedToday: number;
  reservationsWaiting: number;
  overdueBooks: number;
  inventoryAvailable: number;
  inventoryTotal: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}
