import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {
  private readonly port = 8080;
  constructor() { }

  getApiUrl(): string {
    const host = window.location.hostname;
    return `http://${host}:${this.port}`;
  }

getApiUrlWs(): string {
  const host = window.location.hostname;
  return `ws://${host}:${this.port}`;
  }
}
