import { Injectable } from '@angular/core';
import { TOKEN_KEY, USER_KEY } from '../constants/token.constant';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  saveToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  removeToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  saveUser(user: User): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const user = sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  removeUser(): void {
    sessionStorage.removeItem(USER_KEY);
  }

  clearAll(): void {
    this.removeToken();
    this.removeUser();
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    } catch {
      return true;
    }
  }
}
