export type UserRole = 'Admin' | 'User';

export interface Vehicle {
  image: string;
  type: string;
  licensePlate: string;
  km: number;
  brand: string;
  year: number;
  price: {
    hour: number;
    day: number;
    month: number;
  };
  seats: number;
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  vehicles: Vehicle[];
}

export const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    role: 'Admin',
    vehicles: [],
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'user123',
    role: 'User',
    vehicles: [
      {
        image: 'https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_1280.jpg',
        type: 'Sedan',
        licensePlate: '30A-12345',
        km: 35000,
        brand: 'Toyota',
        year: 2019,
        price: { hour: 100000, day: 700000, month: 15000000 },
        seats: 5,
      },
      {
        image: 'https://cdn.pixabay.com/photo/2016/11/29/09/32/auto-1868726_1280.jpg',
        type: 'SUV',
        licensePlate: '29B-67890',
        km: 50000,
        brand: 'Ford',
        year: 2018,
        price: { hour: 120000, day: 900000, month: 18000000 },
        seats: 7,
      },
    ],
  },
]; 