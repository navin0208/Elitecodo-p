import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignStandardWisedataComponent } from './assign-standard-wisedata.component';

describe('AssignStandardWisedataComponent', () => {
  let component: AssignStandardWisedataComponent;
  let fixture: ComponentFixture<AssignStandardWisedataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignStandardWisedataComponent]
    });
    fixture = TestBed.createComponent(AssignStandardWisedataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
