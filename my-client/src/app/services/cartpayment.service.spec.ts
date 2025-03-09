import { TestBed } from '@angular/core/testing';

import { CartpaymentService } from './cartpayment.service';

describe('CartpaymentService', () => {
  let service: CartpaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartpaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
