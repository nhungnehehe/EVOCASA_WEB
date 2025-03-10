import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _currentUserName = new BehaviorSubject<string>('');
  currentUserName$ = this._currentUserName.asObservable();

  setCurrentUserName(name: string): void {
    this._currentUserName.next(name);
  }
}
