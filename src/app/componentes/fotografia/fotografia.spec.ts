import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { Fotografia } from './fotografia';

describe('Fotografia', () => {
  let component: Fotografia;
  let fixture: ComponentFixture<Fotografia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fotografia],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(Fotografia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
