import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CubeDemoComponent } from './cube-demo.component';
import { ArCanvasComponent } from '../ar-canvas/ar-canvas.component';

describe('CubeDemoComponent', () => {
  let component: CubeDemoComponent;
  let fixture: ComponentFixture<CubeDemoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CubeDemoComponent, ArCanvasComponent],
    });
    fixture = TestBed.createComponent(CubeDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
