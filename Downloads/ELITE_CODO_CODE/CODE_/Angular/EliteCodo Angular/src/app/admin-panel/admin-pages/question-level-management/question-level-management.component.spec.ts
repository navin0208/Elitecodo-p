import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionLevelManagementComponent } from './question-level-management.component';

describe('QuestionLevelManagementComponent', () => {
  let component: QuestionLevelManagementComponent;
  let fixture: ComponentFixture<QuestionLevelManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionLevelManagementComponent]
    });
    fixture = TestBed.createComponent(QuestionLevelManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
