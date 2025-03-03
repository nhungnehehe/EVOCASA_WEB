import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentShippingComponent } from './payment-shipping.component';

describe('PaymentShippingComponent', () => {
  let component: PaymentShippingComponent;
  let fixture: ComponentFixture<PaymentShippingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentShippingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
