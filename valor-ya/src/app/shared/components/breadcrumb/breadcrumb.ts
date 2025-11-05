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

    if (url.includes('/valor-ya')) {
      this.breadcrumbs.set([
        baseBreadcrumb,
        {
          label: 'Valor ya',
          // Sin URL para que sea el elemento final
        },
      ]);
    } else if (url.includes('/avaluos-en-garantia')) {
      this.breadcrumbs.set([
        baseBreadcrumb,
        {
          label: 'Avalúos en Garantía',
          // Sin URL para que sea el elemento final
        },
      ]);
    } else {
      this.breadcrumbs.set([baseBreadcrumb]);
    }
  }
}
