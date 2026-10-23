import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { Bienvenido } from './componentes/bienvenido/bienvenido';
import { Registro } from './componentes/registro/registro';

describe('Pruebas de integracion', () => {
  // ---- Integracion: Login exitoso ----
  describe('Login exitoso', () => {
    let component: Bienvenido;
    let fixture: ComponentFixture<Bienvenido>;
    let httpMock: HttpTestingController;
    let router: Router;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [Bienvenido],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
          provideTranslateService(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(Bienvenido);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);
      router = TestBed.inject(Router);
      await fixture.whenStable();
      fixture.detectChanges();
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('debe enviar credenciales, recibir token y navegar a /principal', () => {
      const spyNavigate = vi.spyOn(router, 'navigate');

      component.formulario.get('correo')?.setValue('usuario@correo.com');
      component.formulario.get('contrasena')?.setValue('12345678');
      component.enviarFormulario();

      const req = httpMock.expectOne('/api/users/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'usuario@correo.com',
        password: '12345678',
      });

      req.flush({
        accessToken: 'token-falso-123',
        refreshToken: 'refresh-falso-456',
      });

      expect(localStorage.getItem('auth_access_token')).toBe('token-falso-123');
      expect(spyNavigate).toHaveBeenCalledWith(['/principal']);
    });
  });

  // ---- Integracion: Login fallido ----
  describe('Login fallido', () => {
    let component: Bienvenido;
    let fixture: ComponentFixture<Bienvenido>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [Bienvenido],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
          provideTranslateService(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(Bienvenido);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);
      await fixture.whenStable();
      fixture.detectChanges();
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('debe mostrar el mensaje adecuado cuando el servidor responde 401', () => {
      const spyAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.formulario.get('correo')?.setValue('usuario@correo.com');
      component.formulario.get('contrasena')?.setValue('claveIncorrecta');
      component.enviarFormulario();

      const req = httpMock.expectOne('/api/users/login');
      req.flush({ message: 'No autorizado' }, { status: 401, statusText: 'Unauthorized' });

      expect(spyAlert).toHaveBeenCalledWith('No autorizado');
    });
  });

  // ---- Integracion: Registro de usuario ----
  describe('Registro de usuario', () => {
    let component: Registro;
    let fixture: ComponentFixture<Registro>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
      localStorage.setItem(
        'datosFormularioPersonal',
        JSON.stringify({
          nombre: 'Cristian',
          primerApellido: 'Silva',
          segundoApellido: 'Contreras',
          fechaNacimiento: '2005-12-16',
          genero: 'masculino',
          nacionalidad: 'mexicano',
        }),
      );
      localStorage.setItem(
        'datosFormularioCuenta',
        JSON.stringify({
          telefono: '5512345678',
          email: 'cristian@correo.com',
          nombreUsuario: 'cristian',
          usuario: 'cristian',
          contrasena: '12345678',
          ocupacion: 'estudiante',
          rol: 'estudiante',
        }),
      );
      localStorage.setItem(
        'datosFormularioDireccion',
        JSON.stringify({
          codigoPostal: '12345',
          estado: 'Chihuahua',
          ciudad: 'Chihuahua',
          colonia: 'Centro',
          calle: 'Rio la Compania',
          numeroExterior: '7',
          numeroInterior: '3',
          referencia: 'Casa azul',
        }),
      );

      await TestBed.configureTestingModule({
        imports: [Registro],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
          provideTranslateService(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(Registro);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);
      await fixture.whenStable();
      fixture.detectChanges();

      // Simula que los 3 formularios previos estan completos
      component.pasosComp = { 0: true, 1: true, 2: true };
    });

    afterEach(() => {
      httpMock.verify();
      localStorage.clear();
    });

    it('debe construir y enviar el JSON correcto al endpoint /users', () => {
      component.registrar();

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.first_name).toBe('Cristian');
      expect(req.request.body.email).toBe('cristian@correo.com');
      expect(req.request.body.address_city).toBe('Chihuahua');

      req.flush({ id: 1 });
    });
  });
});
