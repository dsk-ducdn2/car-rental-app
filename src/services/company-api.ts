import type { Company } from '../mock-data/companies';
import { mockCompanies } from '../mock-data/companies';
import { mockVehicles } from '../mock-data/vehicles';

const companies: Company[] = [...mockCompanies];

export function apiGetCompanies(): Promise<Company[]> {
  return new Promise((resolve) => setTimeout(() => resolve([...companies]), 300));
}

export function apiAddCompany(company: Omit<Company, 'id'>): Promise<Company> {
  return new Promise((resolve) => {
    const newCompany: Company = { ...company, id: companies.length + 1 };
    companies.push(newCompany);
    setTimeout(() => resolve(newCompany), 300);
  });
}

export function apiUpdateCompany(id: number, data: Partial<Omit<Company, 'id'>>): Promise<Company | undefined> {
  return new Promise((resolve) => {
    const c = companies.find((c) => c.id === id);
    if (c) Object.assign(c, data);
    setTimeout(() => resolve(c), 300);
  });
}

export function apiDeleteCompany(id: number): Promise<boolean> {
  return new Promise((resolve) => {
    const idx = companies.findIndex((c) => c.id === id);
    if (idx !== -1) {
      companies.splice(idx, 1);
      setTimeout(() => resolve(true), 300);
    } else {
      setTimeout(() => resolve(false), 300);
    }
  });
}

export function apiGetCompanyVehicles(companyId: number) {
  return mockVehicles.filter(v => v.companyId === companyId);
} 