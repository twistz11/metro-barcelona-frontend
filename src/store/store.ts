import { createContext } from 'react';
import { makeAutoObservable } from 'mobx';
import $api from '../http';

export interface User {
  id: string;
  email: string;
  name: string;
  isActivated: boolean;
  preferredLang: 'en' | 'es' | 'ca';
  darkMode: boolean;
}

class Store {
  user: User | null = null;
  isAuth = false;
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAuth(bool: boolean) { this.isAuth = bool; }
  setUser(user: User | null) { this.user = user; }
  setLoading(bool: boolean) { this.isLoading = bool; }

  async login(email: string, password: string) {
    const { data } = await $api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.accessToken);
    this.setAuth(true);
    this.setUser(data.user);
    return data.user;
  }

  async register(email: string, password: string, name: string) {
    const { data } = await $api.post('/auth/register', { email, password, name });
    localStorage.setItem('token', data.accessToken);
    this.setAuth(true);
    this.setUser(data.user);
    return data.user;
  }

  async logout() {
    await $api.post('/auth/logout');
    localStorage.removeItem('token');
    this.setAuth(false);
    this.setUser(null);
  }

  async checkAuth() {
    this.setLoading(true);
    try {
      const { data } = await $api.get('/auth/refresh');
      localStorage.setItem('token', data.accessToken);
      this.setAuth(true);
      this.setUser(data.user);
    } catch {
      this.setAuth(false);
    } finally {
      this.setLoading(false);
    }
  }

  async updatePreferences(prefs: Partial<Pick<User, 'preferredLang' | 'darkMode' | 'name'>>) {
    const { data } = await $api.put('/auth/preferences', prefs);
    this.setUser({ ...this.user!, ...data });
    return data;
  }
}

export const store = new Store();
export const Context = createContext(store);
