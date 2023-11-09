import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaneDemoComponent } from './plane-demo.component';
import { ArCanvasComponent } from '../ar-canvas/ar-canvas.component';

describe('PlaneDemoComponent', () => {
  let component: PlaneDemoComponent;
  let fixture: ComponentFixture<PlaneDemoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlaneDemoComponent, ArCanvasComponent],
    });
    fixture = TestBed.createComponent(PlaneDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
