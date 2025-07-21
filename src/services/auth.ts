import { mockUsers, User, UserRole } from '../mock-data/users';

const users: User[] = [...mockUsers];

export function getUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function validateUser(email: string, password: string): User | undefined {
  return users.find((u) => u.email === email && u.password === password);
}

export function registerUser(email: string, password: string, role: UserRole): User {
  const user: User = {
    id: users.length + 1,
    email,
    password,
    role,
    vehicles: [],
  };
  users.push(user);
  return user;
}

export function getAllUsers(): User[] {
  return users;
}

export function addUser(user: Omit<User, 'id'>): User {
  const newUser: User = { ...user, id: users.length + 1 };
  users.push(newUser);
  return newUser;
}

export function updateUser(id: number, data: Partial<Omit<User, 'id'>>): User | undefined {
  const user = users.find((u) => u.id === id);
  if (user) {
    Object.assign(user, data);
    return user;
  }
  return undefined;
}

export function deleteUser(id: number): boolean {
  const idx = users.findIndex((u) => u.id === id);
  if (idx !== -1) {
    users.splice(idx, 1);
    return true;
  }
  return false;
} 