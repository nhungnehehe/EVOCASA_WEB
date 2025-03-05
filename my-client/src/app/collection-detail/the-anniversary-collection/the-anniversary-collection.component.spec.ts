import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheAnniversaryCollectionComponent } from './the-anniversary-collection.component';

describe('TheAnniversaryCollectionComponent', () => {
  let component: TheAnniversaryCollectionComponent;
  let fixture: ComponentFixture<TheAnniversaryCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TheAnniversaryCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheAnniversaryCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
