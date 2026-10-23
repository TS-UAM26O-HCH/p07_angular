import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('no debe agregar el header Authorization en peticiones de login', () => {
    const req = new HttpRequest('POST', '/api/users/login', {});
    const next: HttpHandlerFn = (request) => {
      expect(request.headers.has('Authorization')).toBeFalsy();
      return of(new HttpResponse({ status: 200 }));
    };
    TestBed.runInInjectionContext(() => authInterceptor(req, next)).subscribe();
  });

  it('no debe agregar el header Authorization si no hay token', () => {
    localStorage.removeItem('auth_access_token');
    const req = new HttpRequest('GET', '/api/users', {});
    const next: HttpHandlerFn = (request) => {
      expect(request.headers.has('Authorization')).toBeFalsy();
      return of(new HttpResponse({ status: 200 }));
    };
    TestBed.runInInjectionContext(() => authInterceptor(req, next)).subscribe();
  });

  it('debe agregar el header Authorization cuando hay token', () => {
    localStorage.setItem('auth_access_token', 'token-valido-123');
    const req = new HttpRequest('GET', '/api/users', {});
    const next: HttpHandlerFn = (request) => {
      expect(request.headers.has('Authorization')).toBeTruthy();
      expect(request.headers.get('Authorization')).toBe('Bearer token-valido-123');
      return of(new HttpResponse({ status: 200 }));
    };
    TestBed.runInInjectionContext(() => authInterceptor(req, next)).subscribe();
  });

  it('debe clonar la peticion sin modificar la original al agregar el token', () => {
    localStorage.setItem('auth_access_token', 'token-valido-123');
    const req = new HttpRequest('POST', '/api/users', { nombre: 'Fulanito' });
    const next: HttpHandlerFn = (request) => {
      expect(request.body).toEqual({ nombre: 'Fulanito' });
      expect(request.headers.get('Authorization')).toBe('Bearer token-valido-123');
      return of(new HttpResponse({ status: 201 }));
    };
    TestBed.runInInjectionContext(() => authInterceptor(req, next)).subscribe();
  });
});
