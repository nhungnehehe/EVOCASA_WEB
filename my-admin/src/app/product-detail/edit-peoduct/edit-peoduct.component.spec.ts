import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPeoductComponent } from './edit-peoduct.component';

describe('EditPeoductComponent', () => {
  let component: EditPeoductComponent;
  let fixture: ComponentFixture<EditPeoductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPeoductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPeoductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
