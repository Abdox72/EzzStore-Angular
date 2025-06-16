import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { CartService } from './cart.service';

interface AuthResponse {
  token: string;
  message?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

interface VerifyEmailRequest {
  userId: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:7249/api/auth';
  private readonly TOKEN_KEY = 'token';

  private authStatusSubject: BehaviorSubject<boolean>;
  authStatus$: Observable<boolean>;

  private adminStatusSubject: BehaviorSubject<boolean>;
  adminStatus$: Observable<boolean>;

  private emailVerifiedSubject: BehaviorSubject<boolean>;
  emailVerified$: Observable<boolean>;

  constructor(
    private http: HttpClient, 
    private jwtHelper: JwtHelperService,
    private cartService: CartService
  ) {
    this.authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
    this.authStatus$ = this.authStatusSubject.asObservable();

    this.adminStatusSubject = new BehaviorSubject<boolean>(this.isAdmin());
    this.adminStatus$ = this.adminStatusSubject.asObservable();

    this.emailVerifiedSubject = new BehaviorSubject<boolean>(this.isEmailVerified());
    this.emailVerified$ = this.emailVerifiedSubject.asObservable();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.emailVerifiedSubject.next(this.isEmailVerified());
        }),
        catchError(this.handleError)
      );
  }

  register(user: RegisterCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/send-token/reset`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  resetPassword(email: string, token: string, newPassword: string): Observable<any> {
    const request: ResetPasswordRequest = { email, token, newPassword };
    return this.http.post(`${this.baseUrl}/reset-password`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  verifyEmail(userId: string, token: string): Observable<any> {
    // const request: VerifyEmailRequest = { userId, token };
    console.log("service - "+token)
    return this.http.get(`${this.baseUrl}/confirm-email?userId=${userId}&token=${token}`)
      .pipe(
        tap(() => this.emailVerifiedSubject.next(true)),
        catchError(this.handleError)
      );
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/send-token/verify`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.cartService.clearCart();
    this.authStatusSubject.next(false);
    this.adminStatusSubject.next(false);
    this.emailVerifiedSubject.next(false);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  isEmailVerified(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const decodedToken = this.jwtHelper.decodeToken(token);
    return decodedToken?.email_verified === true;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.authStatusSubject.next(true);
    this.adminStatusSubject.next(this.isAdmin());
    this.emailVerifiedSubject.next(this.isEmailVerified());
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const decodedToken = this.jwtHelper.decodeToken(token);
    const role = decodedToken?.role || decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return role === 'Admin';
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, userData);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'حدث خطأ غير متوقع';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
