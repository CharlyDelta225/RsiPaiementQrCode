import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../config/api.config';
import { FORCE_STANDALONE_KEY } from '../utils/display-mode';
import { AuthService } from './auth.service';
import { DeviceLockService, PinError } from './device-lock.service';

const USER_VIEW = {
  id: 2,
  email: 'membre@rsi.local',
  firstName: 'Jean',
  lastName: 'Kouassi',
  phone: '+2250700000001',
  role: 'MEMBER',
  templeId: 1,
  templeName: 'Temple de la Victoire',
  active: true,
};

describe('DeviceLockService', () => {
  let service: DeviceLockService;
  let auth: AuthService;
  let http: HttpTestingController;

  function setup(standalone: boolean, deviceToken: string | null): void {
    localStorage.clear();
    if (standalone) {
      localStorage.setItem(FORCE_STANDALONE_KEY, '1');
    }
    if (deviceToken) {
      localStorage.setItem('rsi_device_token', deviceToken);
    }
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(DeviceLockService);
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('ne s’applique pas hors application installée', () => {
    setup(false, 'cle');
    expect(service.isActiveContext()).toBeFalse();
    expect(service.canUnlock()).toBeFalse();
    expect(service.needsSetup()).toBeFalse();
  });

  it('propose la création du code dans l’app installée sans code', () => {
    setup(true, null);
    expect(service.needsSetup()).toBeTrue();
    expect(service.canUnlock()).toBeFalse();
  });

  it('ferme la session à l’ouverture quand un code existe', () => {
    setup(true, 'cle');
    localStorage.setItem('moneglise_token', 'jwt');
    spyOn(auth, 'logout').and.callThrough();
    service.lockOnLaunch();
    expect(auth.logout).toHaveBeenCalled();
  });

  it('déverrouille avec le code et ouvre la session', () => {
    setup(true, 'cle');
    let firstName = '';
    service.unlock('4826').subscribe((user) => (firstName = user.firstName));

    const request = http.expectOne(`${API_BASE_URL}/auth/pin-login`);
    expect(request.request.body).toEqual({ deviceToken: 'cle', pin: '4826' });
    request.flush({ token: 'jwt-frais', user: USER_VIEW });

    expect(firstName).toBe('Jean');
    expect(auth.isAuthenticated()).toBeTrue();
  });

  it('efface la clé quand le serveur désactive le code (423)', () => {
    setup(true, 'cle');
    let error: PinError | null = null;
    service.unlock('0000').subscribe({ error: (e: PinError) => (error = e) });

    http
      .expectOne(`${API_BASE_URL}/auth/pin-login`)
      .flush({ status: 423, error: 'Trop de codes incorrects.', details: null }, { status: 423, statusText: 'Locked' });

    expect(error!.locked).toBeTrue();
    expect(error!.message).toBe('Trop de codes incorrects.');
    expect(service.hasPin()).toBeFalse();
  });

  it('garde la clé sur un simple code faux (401)', () => {
    setup(true, 'cle');
    let error: PinError | null = null;
    service.unlock('0000').subscribe({ error: (e: PinError) => (error = e) });

    http
      .expectOne(`${API_BASE_URL}/auth/pin-login`)
      .flush(
        { status: 401, error: 'Code incorrect. Il vous reste 4 essais.', details: null },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(error!.locked).toBeFalse();
    expect(service.hasPin()).toBeTrue();
  });
});
