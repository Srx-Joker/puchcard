import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, Subject, PuchCard } from '../../services/api';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calendar-container">
      <h2>打卡日历</h2>
      
      <div class="controls">
        <button (click)="prevMonth()">上个月</button>
        <span>{{ currentYear }}年 {{ currentMonth }}月</span>
        <button (click)="nextMonth()">下个月</button>
      </div>

      <div class="table-wrapper">
        <table class="calendar-table">
          <thead>
            <tr>
              <th class="sticky-col">打卡项</th>
              <th *ngFor="let day of daysInMonth" [class.today]="isToday(day)">
                {{ day }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let subject of activeSubjects">
              <td class="sticky-col">{{ subject.name }}</td>
              <td *ngFor="let day of daysInMonth" [class.today]="isToday(day)" class="cell">
                <input 
                  type="checkbox" 
                  [checked]="isPunched(subject.s_id, day)" 
                  (change)="togglePunch(subject.s_id, day, $event)"
                  [disabled]="isFuture(day)"
                />
              </td>
            </tr>
             <!-- 每日完成状态行 -->
            <tr class="summary-row">
              <td class="sticky-col"><strong>每日完成情况</strong></td>
              <td *ngFor="let day of daysInMonth" [class.today]="isToday(day)" class="cell">
                <span *ngIf="isDayComplete(day)" class="completed">✅</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container { padding: 20px; }
    .controls { margin-bottom: 15px; display: flex; gap: 10px; align-items: center; }
    .table-wrapper { overflow-x: auto; }
    .calendar-table { border-collapse: collapse; min-width: 100%; }
    .calendar-table th, .calendar-table td { border: 1px solid #ddd; padding: 5px; text-align: center; min-width: 30px; }
    .sticky-col { position: sticky; left: 0; background: #f9f9f9; z-index: 1; font-weight: bold; min-width: 100px; text-align: left; }
    .today { background-color: #e6f7ff; }
    .cell { cursor: pointer; }
    .completed { color: green; font-size: 1.2em; }
    .summary-row { background-color: #f0f0f0; }
  `]
})
export class CalendarView implements OnInit {
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1;
  daysInMonth: number[] = [];
  
  activeSubjects: Subject[] = [];
  puchCards: PuchCard[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    this.updateDays();
    this.loadData();
  }

  updateDays() {
    const days = new Date(this.currentYear, this.currentMonth, 0).getDate();
    this.daysInMonth = Array.from({ length: days }, (_, i) => i + 1);
  }

  loadData() {
    // 加载启用的打卡项
    this.api.getActiveSubjects().subscribe(subjects => {
      this.activeSubjects = subjects;
    });

    // 加载当月打卡记录
    this.api.getPuchCards(this.currentYear, this.currentMonth).subscribe(cards => {
      this.puchCards = cards;
    });
  }

  prevMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.updateDays();
    this.loadData();
  }

  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.updateDays();
    this.loadData();
  }

  isToday(day: number): boolean {
    const today = new Date();
    return today.getFullYear() === this.currentYear && 
           today.getMonth() + 1 === this.currentMonth && 
           today.getDate() === day;
  }

  isFuture(day: number): boolean {
    const today = new Date();
    const date = new Date(this.currentYear, this.currentMonth - 1, day);
    return date > today;
  }

  getPunch(s_id: number, day: number): PuchCard | undefined {
    return this.puchCards.find(c => {
      const d = new Date(c.datetime);
      return c.s_id === s_id && d.getDate() === day;
    });
  }

  isPunched(s_id: number, day: number): boolean {
    return !!this.getPunch(s_id, day);
  }

  togglePunch(s_id: number, day: number, event: any) {
    const checked = event.target.checked;
    if (checked) {
      // Create punch
      const date = new Date(this.currentYear, this.currentMonth - 1, day);
      // Adjust for timezone offset to ensure correct date is sent
      const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
      
      this.api.createPuchCard(s_id, 1, dateStr).subscribe(newCard => {
        this.puchCards.push(newCard);
      });
    } else {
      // Remove punch (Optional feature, backend doesn't support delete yet in this simple version, 
      // but UI allows unchecked. For now, let's just warn or prevent unchecking if backend doesn't support delete)
      alert("目前暂不支持取消打卡 (后端需实现删除接口)");
      event.target.checked = true; // Revert
    }
  }

  isDayComplete(day: number): boolean {
    if (this.activeSubjects.length === 0) return false;
    // Check if every active subject has a punch for this day
    return this.activeSubjects.every(subject => this.isPunched(subject.s_id, day));
  }
}
