
"use client";

import React, { useState } from 'react';
import type { EmployeeData, UserPermission } from '@/lib/data';
import { findUserByEmail, updateEmployeePermissions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface AdminEmployeesFormProps {
  employees: EmployeeData[];
  onSave: (employee: EmployeeData) => Promise<void>;
}

const allPermissions: { id: UserPermission, label: string }[] = [
    { id: 'manage_academics', label: 'Manage Academics' },
    { id: 'manage_courses', label: 'Manage Courses' },
    { id: 'manage_free_notes', label: 'Manage Free Notes' },
    { id: 'manage_bookstore', label: 'Manage Bookstore' },
    { id: 'manage_quizzes', label: 'Manage Quizzes' },
    { id: 'view_quiz_attempts', label: 'View Quiz Attempts' },
    { id: 'manage_payment_requests', label: 'Manage Payment Requests' },
    { id: 'manage_manual_access', label: 'Manage Manual Access' },
    { id: 'view_purchases', label: 'View Purchases' },
    { id: 'view_payments', label: 'View Payments' },
    { id: 'send_notifications', label: 'Send Notifications' },
    { id: 'view_messages', label: 'View Messages' },
];

export function AdminEmployeesForm({ employees, onSave }: AdminEmployeesFormProps) {
  const [employeeList, setEmployeeList] = useState(employees);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeEmail) return;

    setIsAdding(true);
    try {
        const user = await findUserByEmail(newEmployeeEmail);
        if (!user) {
            throw new Error(`User with email ${newEmployeeEmail} not found. Please ask them to sign up first.`);
        }
        
        if (employeeList.some(emp => emp.uid === user.uid)) {
            throw new Error('This user is already an employee.');
        }

        const newEmployee: EmployeeData = {
            uid: user.uid,
            email: user.email,
            role: 'employee',
            permissions: []
        };

        await onSave(newEmployee);
        setEmployeeList(prev => [...prev, newEmployee]);
        setNewEmployeeEmail('');
        toast({ title: "Employee Added", description: `${user.email} can now be assigned permissions.`});

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error Adding Employee', description: error.message });
    }
    setIsAdding(false);
  };
  
  const handlePermissionChange = (uid: string, permission: UserPermission, checked: boolean) => {
    setEmployeeList(prevList =>
      prevList.map(emp => {
        if (emp.uid === uid) {
          const newPermissions = checked
            ? [...emp.permissions, permission]
            : emp.permissions.filter(p => p !== permission);
          return { ...emp, permissions: newPermissions };
        }
        return emp;
      })
    );
  };

  const handleSavePermissions = (employee: EmployeeData) => {
    onSave(employee);
  };
  
  const handleRemoveEmployee = (uid: string) => {
    const employeeWithNullRole: EmployeeData = { uid, email: '', role: null, permissions: [] };
    onSave(employeeWithNullRole);
    setEmployeeList(prev => prev.filter(emp => emp.uid !== uid));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
          <CardDescription>Enter the email of a registered user to make them an employee.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddEmployee} className="flex items-center gap-4">
            <Input
              type="email"
              placeholder="employee@example.com"
              value={newEmployeeEmail}
              onChange={e => setNewEmployeeEmail(e.target.value)}
              required
              className="flex-grow"
            />
            <Button type="submit" disabled={isAdding}>
              {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {isAdding ? 'Adding...' : 'Add Employee'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {employeeList.filter(e => e.role === 'employee').map(emp => (
          <Card key={emp.uid}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{emp.email}</CardTitle>
                <CardDescription>Role: Employee</CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" />Remove</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove {emp.email}?</AlertDialogTitle>
                        <AlertDialogDescription>This will revoke all their dashboard access. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveEmployee(emp.uid)}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-medium">Permissions</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {allPermissions.map(p => (
                         <div key={p.id} className="flex items-center space-x-2">
                             <Checkbox 
                                id={`${emp.uid}-${p.id}`}
                                checked={emp.permissions.includes(p.id)}
                                onCheckedChange={(checked) => handlePermissionChange(emp.uid, p.id, !!checked)}
                             />
                             <Label htmlFor={`${emp.uid}-${p.id}`}>{p.label}</Label>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-end pt-4">
                    <Button onClick={() => handleSavePermissions(emp)}>
                        <Save className="mr-2 h-4 w-4" /> Save Permissions for {emp.email.split('@')[0]}
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
