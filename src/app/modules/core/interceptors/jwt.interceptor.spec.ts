import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';

import { ENVIRONMENT } from '../../../../environments/token';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthenticationService } from '../services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('JwtInterceptor', () => {
  let authService;

  beforeEach(() => {
    authService = jasmine.createSpyObj(['token']);
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true
        },
        {
          provide: AuthenticationService, useValue: authService,
        },
        { provide: ENVIRONMENT, useValue: true },
      ]
    });
    authService = TestBed.inject(AuthenticationService);
  });

  describe('intercept HTTP requests', () => {

    it('should include authorization headers if user is logged in', inject([HttpClient, HttpTestingController],
      (http: HttpClient, mock: HttpTestingController) => {
        authService.token = 'hello';
        http.get('/').subscribe(
          response => {
            expect(response).toBeTruthy();
          }
        );

        const req = mock.expectOne(r =>
          r.headers.has('Authorization') &&
          r.headers.get('Authorization') === `Bearer hello`,
        );
        expect(req.request.method).toEqual('GET');

        req.flush({ hello: 'world' });
        mock.verify();
      })
    );

    it('should not include authorization headers if no token found', inject([HttpClient, HttpTestingController],
      (http: HttpClient, mock: HttpTestingController) => {
        authService.token = '';
        http.get('/').subscribe(
          response => {
            expect(response).toBeTruthy();
          }
        );

        const req = mock.expectOne(r => !r.headers.has('Authorization'));
        expect(req.request.method).toEqual('GET');

        req.flush({ hello: 'world' });
        mock.verify();
      })
    );

  });
});
