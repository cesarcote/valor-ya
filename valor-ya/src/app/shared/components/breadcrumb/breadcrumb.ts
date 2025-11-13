import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class Breadcrumb {
  private router = inject(Router);
  breadcrumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    this.updateBreadcrumbs();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateBreadcrumbs());
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url;

    const baseBreadcrumb: BreadcrumbItem = {
      label: 'Catastro Bogotá',
      url: '/',
    };

    let currentService: string | null = null;

    if (url.includes('/valor-ya')) {
      currentService = 'valor-ya';
    } else if (url.includes('/avaluos-en-garantia')) {
      currentService = 'avaluos-en-garantia';
    } else if (url.includes('/test/')) {
      currentService = 'test';
    }

    switch (currentService) {
      case 'valor-ya':
        this.breadcrumbs.set([
          baseBreadcrumb,
          {
            label: 'Valor ya',
          },
        ]);
        break;
      case 'avaluos-en-garantia':
        this.breadcrumbs.set([
          baseBreadcrumb,
          {
            label: 'Avalúos en Garantía',
          },
        ]);
        break;
      case 'test':
        this.breadcrumbs.set([
          baseBreadcrumb,
          {
            label: 'Test',
          },
        ]);
        break;
      default:
        this.breadcrumbs.set([baseBreadcrumb]);
        break;
    }
  }
}
