import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowerDemoComponent } from './flower-demo.component';
import { ArCanvasComponent } from '../ar-canvas/ar-canvas.component';

describe('FlowerDemoComponent', () => {
  let component: FlowerDemoComponent;
  let fixture: ComponentFixture<FlowerDemoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlowerDemoComponent, ArCanvasComponent],
    });
    fixture = TestBed.createComponent(FlowerDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
