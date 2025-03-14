import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Admin } from '../interfaces/admin';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // API base URL - adjust this as needed
  private apiUrl = 'http://localhost:3002'; // Change to your actual server URL
  
  // Current admin subject to track logged-in admin
  private currentAdminSubject = new BehaviorSubject<Admin | null>(null);
  public currentAdmin$ = this.currentAdminSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check localStorage for existing admin session
    const storedAdmin = localStorage.getItem('currentAdmin');
    if (storedAdmin) {
      this.currentAdminSubject.next(JSON.parse(storedAdmin));
    }
  }

  // Get all admins
  getAllAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.apiUrl}/admins`)
      .pipe(
        catchError(this.handleError<Admin[]>('getAllAdmins', []))
      );
  }

  // Get admin by ID
  getAdminById(id: string): Observable<Admin> {
    return this.http.get<Admin>(`${this.apiUrl}/admins/${id}`)
      .pipe(
        catchError(this.handleError<Admin>('getAdminById'))
      );
  }

  // Login with employee ID and password
  login(employeeId: string, password: string): Observable<Admin | null> {
    // First get all admins to find the matching employee
    return this.getAllAdmins().pipe(
      map(admins => {
        // Find admin with matching employeeId and password
        const admin = admins.find(a => 
          a.employeeid.toLowerCase() === employeeId.toLowerCase() && 
          a.Password === password
        );
        
        if (admin) {
          // Store admin in localStorage and update the subject
          localStorage.setItem('currentAdmin', JSON.stringify(admin));
          this.currentAdminSubject.next(admin);
          return admin;
        }
        
        return null;
      }),
      catchError(this.handleError<null>('login'))
    );
  }

  // Logout method
  logout(): void {
    localStorage.removeItem('currentAdmin');
    this.currentAdminSubject.next(null);
  }

  // Get current admin
  getCurrentAdmin(): Admin | null {
    return this.currentAdminSubject.value;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const admin = this.getCurrentAdmin();
    return !!admin && !!admin._id; // Make sure we have a valid admin object with ID
  }

  // Error handling
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}