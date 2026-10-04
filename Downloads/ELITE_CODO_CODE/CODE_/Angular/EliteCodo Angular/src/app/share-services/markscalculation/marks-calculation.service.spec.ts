import { TestBed } from '@angular/core/testing';

import { MarksCalculationService } from './marks-calculation.service';

describe('MarksCalculationService', () => {
  let service: MarksCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarksCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
