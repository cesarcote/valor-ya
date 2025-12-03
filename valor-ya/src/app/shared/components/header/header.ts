import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PageHeader } from '../page-header/page-header';
import { ButtonComponent } from '../button/button';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { RegisterModalComponent } from '../register-modal/register-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModalService } from '../../../core/services/auth-modal.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, PageHeader, ButtonComponent, LoginModalComponent, RegisterModalComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly authModalService = inject(AuthModalService);
  private subscription?: Subscription;

  title = 'ValorYa';
  baseUrl = 'https://www.catastrobogota.gov.co/';

  // Estado de los modales
  showLoginModal = signal(false);
  showRegisterModal = signal(false);

  // Estado de autenticación
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    // Escuchar cuando el interceptor solicite abrir el modal de login
    this.subscription = this.authModalService.openLogin$.subscribe(() => {
      this.openLoginModal();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  openLoginModal(): void {
    this.showRegisterModal.set(false);
    this.showLoginModal.set(true);
  }

  openRegisterModal(): void {
    this.showLoginModal.set(false);
    this.showRegisterModal.set(true);
  }

  closeModals(): void {
    this.showLoginModal.set(false);
    this.showRegisterModal.set(false);
  }

  onLoginSuccess(): void {
    this.closeModals();
  }

  onRegisterSuccess(): void {
    this.closeModals();
    // Opcional: abrir login después de registrarse
    // this.openLoginModal();
  }

  logout(): void {
    this.authService.logout();
  }
}
