import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-cancellation-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="dialog-container" dir="rtl">
      <h2 mat-dialog-title>إلغاء الطلب</h2>
      <div mat-dialog-content>
        <p>يرجى تحديد سبب إلغاء الطلب:</p>
        <form [formGroup]="cancellationForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>سبب الإلغاء</mat-label>
            <mat-select formControlName="reason">
              <mat-option value="تغيير رأيي">تغيير رأيي</mat-option>
              <mat-option value="وجدت منتج أفضل">وجدت منتج أفضل</mat-option>
              <mat-option value="سعر غير مناسب">سعر غير مناسب</mat-option>
              <mat-option value="وقت التوصيل طويل">وقت التوصيل طويل</mat-option>
              <mat-option value="أخرى">أخرى</mat-option>
            </mat-select>
            <mat-error *ngIf="cancellationForm.get('reason')?.hasError('required')">
              يرجى اختيار سبب الإلغاء
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width" *ngIf="showOtherReason()">
            <mat-label>سبب آخر</mat-label>
            <textarea matInput formControlName="otherReason" rows="3"></textarea>
            <mat-error *ngIf="cancellationForm.get('otherReason')?.hasError('required')">
              يرجى كتابة سبب الإلغاء
            </mat-error>
          </mat-form-field>
        </form>
      </div>
      <div mat-dialog-actions>
        <button mat-button (click)="onCancel()">إلغاء</button>
        <button mat-raised-button color="warn" (click)="onSubmit()" [disabled]="!isFormValid()">
          تأكيد الإلغاء
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 1rem;
    }
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    mat-dialog-actions {
      display: flex;
      justify-content: flex-start;
      gap: 1rem;
    }
  `]
})
export class CancellationDialogComponent {
  cancellationForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<CancellationDialogComponent>,
    private fb: FormBuilder
  ) {
    this.cancellationForm = this.fb.group({
      reason: ['', Validators.required],
      otherReason: [''],
    });

    // Add validator to otherReason when reason is 'أخرى'
    this.cancellationForm.get('reason')?.valueChanges.subscribe(value => {
      const otherReasonControl = this.cancellationForm.get('otherReason');
      if (value === 'أخرى') {
        otherReasonControl?.setValidators(Validators.required);
      } else {
        otherReasonControl?.clearValidators();
      }
      otherReasonControl?.updateValueAndValidity();
    });
  }

  showOtherReason(): boolean {
    return this.cancellationForm.get('reason')?.value === 'أخرى';
  }

  isFormValid(): boolean {
    return this.cancellationForm.valid;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.cancellationForm.valid) {
      const formValue = this.cancellationForm.value;
      let reason = formValue.reason;
      
      if (reason === 'أخرى' && formValue.otherReason) {
        reason = formValue.otherReason;
      }
      
      this.dialogRef.close(reason);
    }
  }
}