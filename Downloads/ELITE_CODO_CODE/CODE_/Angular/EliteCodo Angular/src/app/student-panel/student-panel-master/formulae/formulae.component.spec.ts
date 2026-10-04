import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaeComponent } from './formulae.component';

describe('FormulaeComponent', () => {
  let component: FormulaeComponent;
  let fixture: ComponentFixture<FormulaeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormulaeComponent]
    });
    fixture = TestBed.createComponent(FormulaeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
