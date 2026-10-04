import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfterexamMessageComponent } from './afterexam-message.component';

describe('AfterexamMessageComponent', () => {
  let component: AfterexamMessageComponent;
  let fixture: ComponentFixture<AfterexamMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AfterexamMessageComponent]
    });
    fixture = TestBed.createComponent(AfterexamMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
