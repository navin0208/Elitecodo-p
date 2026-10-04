import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  private mockUsers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      userType: 'teacher',
      status: 'pending',
      createdAt: new Date(),
      phone: '123-456-7890'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah.w@email.com',
      userType: 'student',
      status: 'pending',
      createdAt: new Date(),
      institution: 'ABC School'
    },
    // Add more mock data as needed
  ];

  private usersSubject = new BehaviorSubject<any[]>(this.mockUsers);

  getUsers(): Observable<any> {
    return this.usersSubject.asObservable();
  }

  approveUser(userId: number): void {
    const updatedUsers = this.mockUsers.map(user =>
      user.id === userId ? { ...user, status: 'approved' } : user
    );
    this.mockUsers = updatedUsers;
    this.usersSubject.next(updatedUsers);
  }

  bulkApprove(userIds: number[]): void {
    const updatedUsers = this.mockUsers.map(user =>
      userIds.includes(user.id) ? { ...user, status: 'approved' } : user
    );
    this.mockUsers = updatedUsers;
    this.usersSubject.next(updatedUsers);
  }
}
