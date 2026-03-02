import { Component } from '@angular/core';
import { SubjectList } from './components/subject-list/subject-list';
import { CalendarView } from './components/calendar-view/calendar-view';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SubjectList, CalendarView],
  template: `
    <div style="font-family: sans-serif; max-width: 1200px; margin: 0 auto;">
      <h1>Punch Card 打卡系统</h1>
      <app-subject-list></app-subject-list>
      <app-calendar-view></app-calendar-view>
    </div>
  `,
})
export class App {}
