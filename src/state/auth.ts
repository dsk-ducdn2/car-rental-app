import { $, useSignal } from '@builder.io/qwik';
import type { User, UserRole } from '../mock-data/users';
import { validateUser, registerUser } from '../services/auth';

export const useAuth = () => {
  const user = useSignal<User | null>(null);

  const login = $(async (email: string, password: string) => {
    const found = validateUser(email, password);
    user.value = found ?? null;
    return found;
  });

  const logout = $(() => {
    user.value = null;
  });

  const register = $(async (email: string, password: string, role: UserRole) => {
    const newUser = registerUser(email, password, role);
    user.value = newUser;
    return newUser;
  });

  return { user, login, logout, register };
}; 