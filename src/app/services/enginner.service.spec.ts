import { TestBed } from '@angular/core/testing';

import { EnginnerService } from './enginner.service';

describe('EnginnerService', () => {
  let service: EnginnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnginnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
