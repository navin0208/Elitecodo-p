import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignStandardWiseDataToStudentComponent } from './assign-standard-wise-data-to-student.component';

describe('AssignStandardWiseDataToStudentComponent', () => {
  let component: AssignStandardWiseDataToStudentComponent;
  let fixture: ComponentFixture<AssignStandardWiseDataToStudentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignStandardWiseDataToStudentComponent]
    });
    fixture = TestBed.createComponent(AssignStandardWiseDataToStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
