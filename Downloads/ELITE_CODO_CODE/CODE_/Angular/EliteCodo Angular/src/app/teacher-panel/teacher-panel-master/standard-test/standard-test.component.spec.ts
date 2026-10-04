import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardTestComponent } from './standard-test.component';

describe('StandardTestComponent', () => {
  let component: StandardTestComponent;
  let fixture: ComponentFixture<StandardTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StandardTestComponent]
    });
    fixture = TestBed.createComponent(StandardTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
