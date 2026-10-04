import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TesttopicComponent } from './testtopic.component';

describe('TesttopicComponent', () => {
  let component: TesttopicComponent;
  let fixture: ComponentFixture<TesttopicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TesttopicComponent]
    });
    fixture = TestBed.createComponent(TesttopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
