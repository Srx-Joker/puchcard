import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, Subject } from '../../services/api';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="subject-container">
      <h2>打卡项管理</h2>
      
      <div class="add-form">
        <input [(ngModel)]="newSubjectName" placeholder="输入打卡项名称" />
        <button (click)="addSubject()">添加</button>
      </div>

      <table class="subject-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let subject of subjects">
            <td>{{ subject.s_id }}</td>
            <td>
              <span *ngIf="!subject.isEditing">{{ subject.name }}</span>
              <input *ngIf="subject.isEditing" [(ngModel)]="subject.editName" />
            </td>
            <td>
              <span [class.active]="subject.status === 1" [class.inactive]="subject.status === 2">
                {{ subject.status === 1 ? '启用' : '关闭' }}
              </span>
            </td>
            <td>
              <button *ngIf="!subject.isEditing" (click)="startEdit(subject)">编辑</button>
              <button *ngIf="subject.isEditing" (click)="saveEdit(subject)">保存</button>
              <button *ngIf="subject.isEditing" (click)="cancelEdit(subject)">取消</button>
              
              <button *ngIf="subject.status === 1" (click)="toggleStatus(subject)">关闭</button>
              <button *ngIf="subject.status === 2" (click)="toggleStatus(subject)">启用</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .subject-container { padding: 20px; border: 1px solid #ccc; margin-bottom: 20px; }
    .add-form { margin-bottom: 15px; }
    .subject-table { width: 100%; border-collapse: collapse; }
    .subject-table th, .subject-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .active { color: green; font-weight: bold; }
    .inactive { color: red; }
    button { margin-right: 5px; }
  `]
})
export class SubjectList implements OnInit {
  subjects: (Subject & { isEditing?: boolean, editName?: string })[] = [];
  newSubjectName: string = '';

  constructor(private api: Api) {}

  ngOnInit() {
    this.loadSubjects();
  }

  loadSubjects() {
    this.api.getSubjects().subscribe(data => {
      this.subjects = data;
    });
  }

  addSubject() {
    if (!this.newSubjectName.trim()) return;
    this.api.createSubject(this.newSubjectName).subscribe(() => {
      this.newSubjectName = '';
      this.loadSubjects();
    });
  }

  startEdit(subject: any) {
    subject.isEditing = true;
    subject.editName = subject.name;
  }

  cancelEdit(subject: any) {
    subject.isEditing = false;
  }

  saveEdit(subject: any) {
    if (subject.editName !== subject.name) {
      this.api.updateSubject(subject.s_id, subject.editName).subscribe(() => {
        subject.name = subject.editName;
        subject.isEditing = false;
      });
    } else {
      subject.isEditing = false;
    }
  }

  toggleStatus(subject: any) {
    const newStatus = subject.status === 1 ? 2 : 1;
    this.api.updateSubject(subject.s_id, undefined, newStatus).subscribe(() => {
      subject.status = newStatus;
    });
  }
}
