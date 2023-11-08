import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaneDemoComponent } from './plane-demo.component';

describe('PlaneDemoComponent', () => {
  let component: PlaneDemoComponent;
  let fixture: ComponentFixture<PlaneDemoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlaneDemoComponent],
    });
    fixture = TestBed.createComponent(PlaneDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
