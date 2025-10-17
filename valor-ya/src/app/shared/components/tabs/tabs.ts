import {
  Component,
  EventEmitter,
  Input,
  Output,
  ContentChildren,
  QueryList,
  TemplateRef,
  AfterContentInit,
} from '@angular/core';

export interface Tab {
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  imports: [],
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.css'],
})
export class TabsComponent {
  @Input() tabs: Tab[] = [];
  @Input() selectedTabIndex: number = 0;
  @Output() tabChange = new EventEmitter<number>();
  @Input() description: string = '';

  selectTab(index: number): void {
    if (!this.tabs[index]?.disabled) {
      this.selectedTabIndex = index;
      this.tabChange.emit(this.selectedTabIndex);
    }
  }
}
