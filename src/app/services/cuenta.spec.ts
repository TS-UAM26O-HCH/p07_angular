import { TestBed } from '@angular/core/testing';
import { CuentaService } from './cuenta';

describe('Cuenta', () => {
  let service: CuentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CuentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
