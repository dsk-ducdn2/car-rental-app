import type { User } from '../mock-data/users';
import { getAllUsers, addUser, updateUser, deleteUser } from './auth';

export function apiGetUsers(): Promise<User[]> {
  return new Promise((resolve) => setTimeout(() => resolve(getAllUsers()), 300));
}

export function apiAddUser(user: Omit<User, 'id'>): Promise<User> {
  return new Promise((resolve) => setTimeout(() => resolve(addUser(user)), 300));
}

export function apiUpdateUser(id: number, data: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
  return new Promise((resolve) => setTimeout(() => resolve(updateUser(id, data)), 300));
}

export function apiDeleteUser(id: number): Promise<boolean> {
  return new Promise((resolve) => setTimeout(() => resolve(deleteUser(id)), 300));
} 