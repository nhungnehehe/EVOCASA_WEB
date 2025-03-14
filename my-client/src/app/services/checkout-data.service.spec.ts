import { TestBed } from '@angular/core/testing';

import { CheckoutDataService } from './checkout-data.service';

describe('CheckoutDataService', () => {
  let service: CheckoutDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
