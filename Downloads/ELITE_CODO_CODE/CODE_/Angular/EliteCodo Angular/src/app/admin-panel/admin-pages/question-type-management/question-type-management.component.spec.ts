import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionTypeManagementComponent } from './question-type-management.component';

describe('QuestionTypeManagementComponent', () => {
  let component: QuestionTypeManagementComponent;
  let fixture: ComponentFixture<QuestionTypeManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionTypeManagementComponent]
    });
    fixture = TestBed.createComponent(QuestionTypeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
