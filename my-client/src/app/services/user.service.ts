import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _currentUserName = new BehaviorSubject<string>('');
  currentUserName$ = this._currentUserName.asObservable();

  private _currentUserPhone = new BehaviorSubject<string>('');
  currentUserPhone$ = this._currentUserPhone.asObservable();

  setCurrentUserName(name: string): void {
    this._currentUserName.next(name);
  }

  setCurrentUserPhone(phone: string): void {
    this._currentUserPhone.next(phone);
    localStorage.setItem('currentUserPhone', phone);
  }

  clearCurrentUser(): void {
    this._currentUserName.next('');
  }
}