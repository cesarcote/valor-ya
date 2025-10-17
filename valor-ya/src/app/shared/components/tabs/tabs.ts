import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

interface Tab {
  label: string;
  content: TemplateRef<any>;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  imports: [NgTemplateOutlet],
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

export type { Tab };
