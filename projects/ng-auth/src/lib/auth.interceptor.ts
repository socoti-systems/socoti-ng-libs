import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { from } from 'rxjs';
import { AuthService } from './auth.service';
import { AUTH_CONFIG } from './auth.config';

/**
 * HTTP interceptor that:
 * 1. Adds Bearer token to requests targeting the configured apiUrl
 * 2. On 401: tries silent refresh, retries the request, or redirects to login
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const config = inject(AUTH_CONFIG);

  const isApiRequest = req.url.startsWith(config.apiUrl);
  if (!isApiRequest) return next(req);

  const token = auth.getToken();
  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        // Try silent refresh and retry the request
        return from(auth.trySilentRefresh()).pipe(
          switchMap((refreshed) => {
            if (refreshed) {
              const newToken = auth.getToken();
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              });
              return next(retryReq);
            }
            // Refresh failed — force login
            auth.forceLogin();
            return throwError(() => error);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
