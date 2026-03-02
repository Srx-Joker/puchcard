import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subject {
  s_id: number;
  name: string;
  status: number;
}

export interface PuchCard {
  p_id: number;
  s_id: number;
  status: number;
  datetime: string;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects/`);
  }

  getActiveSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects/active`);
  }

  createSubject(name: string, status: number = 1): Observable<Subject> {
    return this.http.post<Subject>(`${this.baseUrl}/subjects/`, { name, status });
  }

  updateSubject(s_id: number, name?: string, status?: number): Observable<Subject> {
    const payload: any = {};
    if (name) payload.name = name;
    if (status) payload.status = status;
    return this.http.put<Subject>(`${this.baseUrl}/subjects/${s_id}`, payload);
  }

  getPuchCards(year: number, month: number): Observable<PuchCard[]> {
    return this.http.get<PuchCard[]>(`${this.baseUrl}/puchcards/${year}/${month}`);
  }

  createPuchCard(s_id: number, status: number, datetime: string): Observable<PuchCard> {
    return this.http.post<PuchCard>(`${this.baseUrl}/puchcards/`, { s_id, status, datetime });
  }
}
