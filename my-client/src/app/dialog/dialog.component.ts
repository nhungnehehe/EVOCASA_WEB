import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  standalone: false,
  template: `
  <div class="confirm-dialog">
    <div class="dialog-header">
      <div class="icon-container">
        <span class="material-icons">logout</span>
      </div>
      <h2>Log Out</h2>
    </div>
    
    <div class="dialog-content">
      <p>Are you sure you want to log out?</p>
      <p class="subtext">You will need to sign in again to access your account.</p>
    </div>
    
    <div class="actions">
      <button class="confirm-btn" (click)="onYesClick()">Log Out</button>
      <button class="cancel-btn" (click)="onNoClick()">Cancel</button>
    </div>
  </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .confirm-dialog {
      padding: 24px;
      width: 100%;
      max-width: 320px;
      box-sizing: border-box;
      border-radius: 8px;
      font-family: 'Helvetica', Arial, sans-serif;
      background-color: white;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .icon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      background-color: #F5EFE6;
      border-radius: 50%;
      margin-right: 12px;
    }
    
    .material-icons {
      color: #90704F;
      font-size: 24px;
    }
    
    h2 {
      margin: 0;
      font-size: 20px;
      color: #4F3422;
    }
    
    .dialog-content {
      margin-bottom: 24px;
      text-align: center;
    }
    
    p {
      margin: 0 0 8px 0;
      color: #4F3422;
      font-size: 16px;
    }
    
    .subtext {
      color: #90704F;
      font-size: 14px;
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .cancel-btn {
      padding: 10px 16px;
      background-color: #F5EFE6;
      color: #4F3422;
      border: 1px solid #D8C4B6;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .cancel-btn:hover {
      background-color: #E8DFD8;
    }
    
    .confirm-btn {
      padding: 10px 16px;
      background-color: #90704F;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .confirm-btn:hover {
      background-color: #7D5F41;
    }
  `]
})
export class DialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {title?: string, message?: string}
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}