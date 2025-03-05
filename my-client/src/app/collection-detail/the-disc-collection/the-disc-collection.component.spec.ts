import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheDiscCollectionComponent } from './the-disc-collection.component';

describe('TheDiscCollectionComponent', () => {
  let component: TheDiscCollectionComponent;
  let fixture: ComponentFixture<TheDiscCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TheDiscCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheDiscCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
