import { Component, inject, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from '../breadcrumb/breadcrumb';

@Component({
  selector: 'app-page-header',
  imports: [Breadcrumb],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeader {
  private router = inject(Router);
  private currentRoute = signal<string>('');

  title = computed(() => {
    const route = this.currentRoute();

    if (route.includes('/valor-ya')) {
      return 'Valor ya';
    } else if (route.includes('/avaluos-en-garantia')) {
      return 'Avalúos en Garantía';
    }

    return '';
  });

  constructor() {
    this.currentRoute.set(this.router.url);

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.currentRoute.set(this.router.url);
    });
  }
}
