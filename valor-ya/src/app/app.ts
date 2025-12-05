import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/layout/header/header';
import { Footer } from './shared/components/layout/footer/footer.component';
import { ServiceArea } from './shared/components/layout/service-area/service-area';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ServiceArea],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('valor-ya');
}
