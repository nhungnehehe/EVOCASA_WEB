import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SabiCollectionComponent } from './sabi-collection.component';

describe('SabiCollectionComponent', () => {
  let component: SabiCollectionComponent;
  let fixture: ComponentFixture<SabiCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SabiCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SabiCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
