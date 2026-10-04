import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestchapterComponent } from './testchapter.component';

describe('TestchapterComponent', () => {
  let component: TestchapterComponent;
  let fixture: ComponentFixture<TestchapterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestchapterComponent]
    });
    fixture = TestBed.createComponent(TestchapterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
