import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-refund-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CommonModule
  ],
  template: `
    <div class="dialog-container" dir="rtl">
      <h2 mat-dialog-title>طلب استرداد المبلغ</h2>
      <div mat-dialog-content>
        <p>يرجى تحديد سبب طلب استرداد المبلغ:</p>
        <form [formGroup]="refundForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>سبب الاسترداد</mat-label>
            <mat-select formControlName="reason">
              <mat-option value="المنتج معيب">المنتج معيب</mat-option>
              <mat-option value="المنتج لا يطابق الوصف">المنتج لا يطابق الوصف</mat-option>
              <mat-option value="المنتج تالف">المنتج تالف</mat-option>
              <mat-option value="استلمت منتج خاطئ">استلمت منتج خاطئ</mat-option>
              <mat-option value="أخرى">أخرى</mat-option>
            </mat-select>
            <mat-error *ngIf="refundForm.get('reason')?.hasError('required')">
              يرجى اختيار سبب الاسترداد
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width" *ngIf="showOtherReason()">
            <mat-label>سبب آخر</mat-label>
            <textarea matInput formControlName="otherReason" rows="3"></textarea>
            <mat-error *ngIf="refundForm.get('otherReason')?.hasError('required')">
              يرجى كتابة سبب الاسترداد
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>تفاصيل إضافية</mat-label>
            <textarea matInput formControlName="details" rows="3" placeholder="يرجى وصف المشكلة بالتفصيل"></textarea>
          </mat-form-field>
        </form>
      </div>
      <div mat-dialog-actions>
        <button mat-button (click)="onCancel()">إلغاء</button>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!isFormValid()">
          تقديم طلب الاسترداد
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
export class RefundDialogComponent {
  refundForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<RefundDialogComponent>,
    private fb: FormBuilder
  ) {
    this.refundForm = this.fb.group({
      reason: ['', Validators.required],
      otherReason: [''],
      details: [''],
    });

    // Add validator to otherReason when reason is 'أخرى'
    this.refundForm.get('reason')?.valueChanges.subscribe(value => {
      const otherReasonControl = this.refundForm.get('otherReason');
      if (value === 'أخرى') {
        otherReasonControl?.setValidators(Validators.required);
      } else {
        otherReasonControl?.clearValidators();
      }
      otherReasonControl?.updateValueAndValidity();
    });
  }

  showOtherReason(): boolean {
    return this.refundForm.get('reason')?.value === 'أخرى';
  }

  isFormValid(): boolean {
    return this.refundForm.valid;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.refundForm.valid) {
      const formValue = this.refundForm.value;
      let reason = formValue.reason;
      
      if (reason === 'أخرى' && formValue.otherReason) {
        reason = formValue.otherReason;
      }
      
      if (formValue.details) {
        reason += ` - ${formValue.details}`;
      }
      
      this.dialogRef.close(reason);
    }
  }
}