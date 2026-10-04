import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusWiseQuestionsComponent } from './status-wise-questions.component';

describe('StatusWiseQuestionsComponent', () => {
  let component: StatusWiseQuestionsComponent;
  let fixture: ComponentFixture<StatusWiseQuestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatusWiseQuestionsComponent]
    });
    fixture = TestBed.createComponent(StatusWiseQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
