export interface Company {
  id: number;
  name: string;
  vehicleIds: number[];
  revenue: number;
}

export const mockCompanies: Company[] = [
  {
    id: 1,
    name: 'Công ty ABC Car Rental',
    vehicleIds: [1, 2],
    revenue: 120000000,
  },
  {
    id: 2,
    name: 'Công ty XYZ Auto',
    vehicleIds: [3, 4],
    revenue: 95000000,
  },
]; 