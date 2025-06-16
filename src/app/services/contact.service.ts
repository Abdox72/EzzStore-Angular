import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContactFormData } from '../interfaces/contactFormData';


@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) { }

  submitContactForm(formData: ContactFormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
  //get all contacts
  getAllContacts(): Observable<any> {
    return this.http.get<ContactFormData>(this.apiUrl);
  }

  deleteContact(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
} 