import { TestBed } from '@angular/core/testing';
import { DireccionService } from './direccion';

describe('Direccion', () => {
  let service: DireccionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DireccionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
