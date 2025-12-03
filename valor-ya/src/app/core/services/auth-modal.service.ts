import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  private readonly openLoginModal$ = new Subject<void>();

  readonly openLogin$ = this.openLoginModal$.asObservable();

  openLoginModal(): void {
    this.openLoginModal$.next();
  }
}
