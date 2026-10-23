import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { Bienvenido } from './bienvenido';

describe('Bienvenido', () => {
  let component: Bienvenido;
  let fixture: ComponentFixture<Bienvenido>;

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
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---- Prueba unitaria: Validacion de correo ----
  describe('Validacion de correo', () => {
    it('debe marcar el campo correo como invalido si esta vacio', () => {
      const correo = component.formulario.get('correo');
      correo?.setValue('');
      expect(correo?.valid).toBeFalsy();
    });

    it('debe marcar el campo correo como invalido si el formato es incorrecto', () => {
      const correo = component.formulario.get('correo');
      correo?.setValue('correo-no-valido');
      expect(correo?.valid).toBeFalsy();
    });

    it('debe marcar el campo correo como valido si el formato es correcto', () => {
      const correo = component.formulario.get('correo');
      correo?.setValue('usuario@correo.com');
      expect(correo?.valid).toBeTruthy();
    });
  });

  // ---- Prueba unitaria: Validacion de formulario ----
  describe('Validacion de formulario', () => {
    it('el formulario no debe ser valido si faltan campos obligatorios', () => {
      component.formulario.get('correo')?.setValue('');
      component.formulario.get('contrasena')?.setValue('');
      expect(component.formulario.valid).toBeFalsy();
    });

    it('el formulario debe ser valido si todos los campos estan llenos correctamente', () => {
      component.formulario.get('correo')?.setValue('usuario@correo.com');
      component.formulario.get('contrasena')?.setValue('12345678');
      expect(component.formulario.valid).toBeTruthy();
    });
  });

  // ---- Prueba de componente: Renderizado de login ----
  describe('Renderizado de login', () => {
    it('debe mostrar el titulo de la aplicacion', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const h1 = compiled.querySelector('h1');
      expect(h1).toBeTruthy();
    });

    it('debe mostrar el campo de correo', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const inputCorreo = compiled.querySelector('#correo');
      expect(inputCorreo).toBeTruthy();
    });

    it('debe mostrar el campo de contrasena', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const inputContrasena = compiled.querySelector('#contrasena');
      expect(inputContrasena).toBeTruthy();
    });

    it('debe mostrar el boton de acceder', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const boton = compiled.querySelector('button[type="submit"]');
      expect(boton).toBeTruthy();
    });
  });

  // ---- Prueba de componente: Mensajes de error ----
  describe('Mensajes de error', () => {
    it('no debe mostrar mensaje de error si el campo no ha sido tocado', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const mensajeError = compiled.querySelector('.mensaje-error');
      expect(mensajeError).toBeFalsy();
    });

    it('debe mostrar mensaje de error cuando el campo correo es invalido y fue tocado', () => {
      const correo = component.formulario.get('correo');
      correo?.setValue('');
      correo?.markAsTouched();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const mensajeError = compiled.querySelector('.mensaje-error');
      expect(mensajeError).toBeTruthy();
    });

    it('debe aplicar la clase error al input cuando el campo es invalido y fue tocado', () => {
      const contrasena = component.formulario.get('contrasena');
      contrasena?.setValue('');
      contrasena?.markAsTouched();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('#contrasena');
      expect(input?.classList.contains('error')).toBeTruthy();
    });
  });
});
