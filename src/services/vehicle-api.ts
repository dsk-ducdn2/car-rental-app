import type { Vehicle, VehicleStatus } from '../mock-data/vehicles';
import { mockVehicles } from '../mock-data/vehicles';

const vehicles: Vehicle[] = [...mockVehicles];

export function apiGetVehicles(filter?: { status?: VehicleStatus; sortBy?: 'rating' | 'rentCount' }): Promise<Vehicle[]> {
  return new Promise((resolve) => {
    let result = [...vehicles];
    if (filter?.status) {
      result = result.filter((v) => v.status === filter.status);
    }
    if (filter?.sortBy) {
      const key = filter.sortBy as 'rating' | 'rentCount';
      result = result.sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));
    }
    setTimeout(() => resolve(result), 300);
  });
}

export function apiAddVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
  return new Promise((resolve) => {
    const newVehicle: Vehicle = { ...vehicle, id: vehicles.length + 1 };
    vehicles.push(newVehicle);
    setTimeout(() => resolve(newVehicle), 300);
  });
}

export function apiUpdateVehicle(id: number, data: Partial<Omit<Vehicle, 'id'>>): Promise<Vehicle | undefined> {
  return new Promise((resolve) => {
    const v = vehicles.find((v) => v.id === id);
    if (v) Object.assign(v, data);
    setTimeout(() => resolve(v), 300);
  });
}

export function apiDeleteVehicle(id: number): Promise<boolean> {
  return new Promise((resolve) => {
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx !== -1) {
      vehicles.splice(idx, 1);
      setTimeout(() => resolve(true), 300);
    } else {
      setTimeout(() => resolve(false), 300);
    }
  });
} 