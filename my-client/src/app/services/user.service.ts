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

  constructor() {
    // Load saved user data from localStorage on service initialization
    const savedPhone = localStorage.getItem('currentUserPhone');
    if (savedPhone) {
      this._currentUserPhone.next(savedPhone);
    }
    
    // Add this code to also load the name
    const savedName = localStorage.getItem('currentUserName');
    if (savedName) {
      this._currentUserName.next(savedName);
    }
  }

  setCurrentUserName(name: string): void {
    this._currentUserName.next(name);
    localStorage.setItem('currentUserName', name);
  }

  setCurrentUserPhone(phone: string): void {
    this._currentUserPhone.next(phone);
    localStorage.setItem('currentUserPhone', phone);
  }

  clearCurrentUser(): void {
    this._currentUserName.next('');
    this._currentUserPhone.next('');
    localStorage.removeItem('currentUserPhone');
    localStorage.removeItem('currentUserName');
  }

  isLoggedIn(): boolean {
    return !!this._currentUserPhone.value;
  }
}