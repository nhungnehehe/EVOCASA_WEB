import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThePavilionCollectionComponent } from './the-pavilion-collection.component';

describe('ThePavilionCollectionComponent', () => {
  let component: ThePavilionCollectionComponent;
  let fixture: ComponentFixture<ThePavilionCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThePavilionCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThePavilionCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
