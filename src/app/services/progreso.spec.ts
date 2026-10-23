import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ProgresoService } from './progreso';

describe('ProgresoService', () => {
  let service: ProgresoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgresoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('el paso actual debe iniciar en 0', async () => {
    const paso = await firstValueFrom(service.pasoActual$);
    expect(paso).toBe(0);
  });

  it('los pasos completados deben iniciar vacios', async () => {
    const completados = await firstValueFrom(service.pasosCompletados$);
    expect(Object.keys(completados).length).toBe(0);
  });

  it('debe actualizar el paso actual correctamente', async () => {
    service.establecerPasoActual(2);
    const paso = await firstValueFrom(service.pasoActual$);
    expect(paso).toBe(2);
  });

  it('debe marcar un paso como completado', async () => {
    service.completarPaso(0);
    const completados = await firstValueFrom(service.pasosCompletados$);
    expect(completados[0]).toBeTruthy();
  });

  it('debe marcar multiples pasos como completados sin perder los anteriores', async () => {
    service.completarPaso(0);
    service.completarPaso(1);
    service.completarPaso(2);
    const completados = await firstValueFrom(service.pasosCompletados$);
    expect(completados[0]).toBeTruthy();
    expect(completados[1]).toBeTruthy();
    expect(completados[2]).toBeTruthy();
  });

  it('debe retornar los pasos completados actuales sincronicamente', () => {
    service.completarPaso(1);
    const completados = service.obtenerPasosCompletados();
    expect(completados[1]).toBeTruthy();
  });
});
