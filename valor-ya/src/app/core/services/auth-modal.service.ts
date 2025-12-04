import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  private readonly openLoginModal$ = new Subject<void>();
  private readonly loginSuccess$ = new Subject<void>();

  readonly openLogin$ = this.openLoginModal$.asObservable();
  readonly onLoginSuccess$ = this.loginSuccess$.asObservable();

  openLoginModal(): void {
    this.openLoginModal$.next();
  }

  notifyLoginSuccess(): void {
    this.loginSuccess$.next();
  }
}
