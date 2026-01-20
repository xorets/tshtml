import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.tshtml',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('tshtml-integration-guide');
}
