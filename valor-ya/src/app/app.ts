import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LoadingComponent } from './shared/components/loading/loading';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('valor-ya');
}
