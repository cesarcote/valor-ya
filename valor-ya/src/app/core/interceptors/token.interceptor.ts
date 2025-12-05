import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../auth/services/token.service';
import { AuthModalService } from '../auth/services/auth-modal.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authModalService = inject(AuthModalService);
  const token = tokenService.getToken();

  if (!token) {
    return next(req);
  }

  // Si el token expiró, limpiar y continuar sin token
  if (tokenService.isTokenExpired()) {
    tokenService.clearAll();
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq).pipe(
    catchError((err) => {
      // Si el servidor responde 401, el token es inválido
      if (err.status === 401) {
        tokenService.clearAll();
        authModalService.openLoginModal();
      }
      return throwError(() => err);
    })
  );
};
