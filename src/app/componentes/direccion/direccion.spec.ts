import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { Direccion } from './direccion';

describe('Direccion', () => {
  let component: Direccion;
  let fixture: ComponentFixture<Direccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Direccion],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(Direccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
