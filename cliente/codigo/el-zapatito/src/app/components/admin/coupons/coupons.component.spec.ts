import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CouponsComponent } from './coupons.component';

describe('CouponsComponent', () => {
  let component: CouponsComponent;
  let fixture: ComponentFixture<CouponsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponsComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CouponsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should reset creating state when the coupon request fails', () => {
    component.newCoupon.name = 'Promo test';
    component.newCoupon.percentage = 10;

    component.createCoupon();

    expect(component.creatingCoupon).toBeTrue();

    const req = httpMock.expectOne('http://localhost:8000/coupons/');
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(component.creatingCoupon).toBeFalse();
    expect(component.formMessage).toContain('No se pudo crear el cupón');
  });
});
