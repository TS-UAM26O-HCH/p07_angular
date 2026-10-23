import { TestBed } from '@angular/core/testing';
import { PersonalService } from './personal';

describe('Personal', () => {
  let service: PersonalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
