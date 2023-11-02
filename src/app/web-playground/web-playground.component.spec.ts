import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebPlaygroundComponent } from './web-playground.component';

describe('WebPlaygroundComponent', () => {
  let component: WebPlaygroundComponent;
  let fixture: ComponentFixture<WebPlaygroundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebPlaygroundComponent]
    });
    fixture = TestBed.createComponent(WebPlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
