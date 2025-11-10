import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer.component';
import { ServiceAreaComponent } from './shared/components/service-area/service-area';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ServiceAreaComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('valor-ya');
}
