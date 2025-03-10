import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { Account } from '../interfaces/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:3002';

  constructor(private _http: HttpClient) { }

  checkPhoneNumberExist(phonenumber: string): Observable<any> {
    const url = `${this.apiUrl}/accounts/${phonenumber}`;
    
    // Sử dụng kiểu dữ liệu JSON mặc định thay vì text
    return this._http.get<any>(url).pipe(
      retry(3),
      catchError((error) => {
        console.error('API Error:', error);
        return throwError(() => new Error(error.message || 'Server error'));
      })
    );
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message));
  }

  postAccount(aAccount: any): Observable<any> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/json;charset=utf-8'
    );
    const requestOptions: Object = {
      headers: headers,
      responseType: 'text'
    };
    return this._http.post<any>(`${this.apiUrl}/accounts`, JSON.stringify(aAccount), requestOptions).pipe(
      map(res => JSON.parse(res) as Account),
      retry(3),
      catchError(this.handleError)
    );
  }

  changePassword(phoneNumber: string, oldPassword: string, newPassword: string): Observable<any> {
    const url = `${this.apiUrl}/change-password`;
    const body = { phoneNumber, oldPassword, newPassword };
    return this._http.put<any>(url, body).pipe(
      catchError((error) => {
        console.error('Change password error:', error);
        return throwError(() => new Error(error.message || 'Error changing password'));
      })
    );
  }

// Trong AccountService
resetPassword(phoneNumber: string, newPassword: string): Observable<any> {
  const url = `${this.apiUrl}/reset-password`;
  const body = { phonenumber: phoneNumber, newPassword };
  return this._http.put<any>(url, body).pipe(
    catchError((error) => {
      console.error('Reset password error:', error);
      return throwError(() => new Error(error.message || 'Error resetting password'));
    })
  );
}

  checkPasswordResetSuccess(phonenumber: string): Observable<any> {
    // Gửi yêu cầu đến API để kiểm tra trạng thái đặt lại mật khẩu
    return this._http.get<any>(`${this.apiUrl}/check-password-reset/${phonenumber}`).pipe(
      catchError((error) => {
        console.error('Check reset status error:', error);
        return throwError(() => new Error(error.message || 'Error checking reset status'));
      })
    );
  }

  // Phương thức để gửi yêu cầu mã xác thực cho quá trình reset mật khẩu
  requestVerificationCode(phoneNumber: string): Observable<any> {
    const url = `${this.apiUrl}/request-verification`;
    return this._http.post<any>(url, { phoneNumber }).pipe(
      catchError((error) => {
        console.error('Request verification code error:', error);
        return throwError(() => new Error(error.message || 'Error requesting verification code'));
      })
    );
  }

  // Phương thức để xác thực mã đã nhập
  verifyCode(phoneNumber: string, code: string): Observable<any> {
    const url = `${this.apiUrl}/verify-code`;
    return this._http.post<any>(url, { phoneNumber, code }).pipe(
      catchError((error) => {
        console.error('Verify code error:', error);
        return throwError(() => new Error(error.message || 'Error verifying code'));
      })
    );
  }
}