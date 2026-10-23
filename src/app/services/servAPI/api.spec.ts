import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Api } from './api';

describe('Api', () => {
  let service: Api;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(Api);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---- Contrato: Respuesta de login ----
  describe('Contrato: Respuesta de login', () => {
    it('debe construir correctamente la peticion POST al endpoint /users/login', () => {
      service.login({ email: 'usuario@correo.com', password: '12345678' }).subscribe();

      const req = httpMock.expectOne('/api/users/login');
      expect(req.request.method).toBe('POST');
      req.flush({ accessToken: 'abc123', refreshToken: 'xyz789' });
    });

    it('debe aceptar una respuesta que cumple con la estructura esperada (accessToken y refreshToken)', () => {
      const respuestaEsperada = {
        accessToken: 'abc123',
        refreshToken: 'xyz789',
      };

      service
        .login({ email: 'usuario@correo.com', password: '12345678' })
        .subscribe((response: any) => {
          expect(response.accessToken).toBeDefined();
          expect(response.refreshToken).toBeDefined();
          expect(typeof response.accessToken).toBe('string');
          expect(typeof response.refreshToken).toBe('string');
        });

      const req = httpMock.expectOne('/api/users/login');
      req.flush(respuestaEsperada);
    });

    it('debe almacenar los tokens en localStorage cuando la respuesta cumple el contrato esperado', () => {
      service.login({ email: 'usuario@correo.com', password: '12345678' }).subscribe();

      const req = httpMock.expectOne('/api/users/login');
      req.flush({ accessToken: 'token-valido', refreshToken: 'refresh-valido' });

      expect(service.getToken()).toBe('token-valido');
      expect(service.getRefreshToken()).toBe('refresh-valido');
    });

    it('no debe almacenar tokens si la respuesta no cumple con el contrato esperado (faltan campos)', () => {
      service.login({ email: 'usuario@correo.com', password: '12345678' }).subscribe();

      const req = httpMock.expectOne('/api/users/login');
      req.flush({ mensaje: 'respuesta inesperada sin tokens' });

      expect(service.getToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
    });
  });
});
