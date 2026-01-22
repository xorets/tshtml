import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.tshtml',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('tshtml-integration-guide');

  now = new Date().toISOString();

  items = ['TypeScript-authored templates', 'Angular bindings at runtime', 'Template composition at build time'];
}
