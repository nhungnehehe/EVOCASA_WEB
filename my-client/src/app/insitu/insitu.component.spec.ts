import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsituComponent } from './insitu.component';

describe('InsituComponent', () => {
  let component: InsituComponent;
  let fixture: ComponentFixture<InsituComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InsituComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsituComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
