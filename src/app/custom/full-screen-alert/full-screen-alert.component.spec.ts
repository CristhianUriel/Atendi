import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullScreenAlertComponent } from './full-screen-alert.component';

describe('FullScreenAlertComponent', () => {
  let component: FullScreenAlertComponent;
  let fixture: ComponentFixture<FullScreenAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullScreenAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullScreenAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
