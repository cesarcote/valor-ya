import { Component } from '@angular/core';
import { PageHeader } from '../page-header/page-header';

@Component({
  selector: 'app-header',
  imports: [PageHeader],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  title = 'ValorYa';
}
