import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2, Mail, Calendar, User, Plus } from 'lucide-react';

const departmentColors = {
  Engineering: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Design: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  Product: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  Sales: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  HR: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  Finance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Operations: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

// ---------- Employee Table ----------
export const EmployeeTable = ({ employees, onEdit, onDelete, isLoading = false }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      setDeletingId(employeeToDelete.id);
      onDelete(employeeToDelete.email);
    }
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-custom-lg">
        <div className="p-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card className="bg-card border-border shadow-custom-lg">
        <div className="p-12 text-center">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">No employees found</h3>
          <p className="text-muted-foreground">
            Add your first employee to get started with team management.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card border-border shadow-custom-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="font-medium">{employee.name}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        {employee.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        departmentColors[employee.department] || departmentColors.Operations
                      }
                    >
                      {employee.department}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(employee.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(employee)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(employee)}
                        disabled={deletingId === employee.id}
                      >
                        {deletingId === employee.id ? '...' : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{employeeToDelete?.name}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete Employee
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ---------- Hook: useEmployees ----------
const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setEmployees(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const addEmployee = async (emp) => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp),
      });
      if (!res.ok) throw new Error('Failed to add employee');
      fetchEmployees();
    } catch (e) {
      setError(e.message);
    }
  };

  const updateEmployee = async (emp) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${emp.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp),
      });
      if (!res.ok) throw new Error('Failed to update employee');
      fetchEmployees();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteEmployee = async (email) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${email}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete employee');
      fetchEmployees();
    } catch (e) {
      setError(e.message);
    }
  };

  return { employees, isLoading, error, addEmployee, updateEmployee, deleteEmployee };
};

// ---------- Form ----------
const EmployeeForm = ({ employee, onSave, onCancel }) => {
  const [formData, setFormData] = useState(employee || { name: '', email: '', department: '', role: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(employee || { name: '', email: '', department: '', role: '' });
  }, [employee]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((p) => ({ ...p, [id]: value }));
  };

  const handleDept = (val) => setFormData((p) => ({ ...p, department: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input id="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="department" className="text-right">
            Department
          </Label>
          <Select onValueChange={handleDept} value={formData.department} required>
            <SelectTrigger id="department" className="col-span-3">
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(departmentColors).map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">
            Role
          </Label>
          <Input id="role" value={formData.role} onChange={handleChange} className="col-span-3" required />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  );
};

// ---------- Main App ----------
export default function App() {
  const { employees, isLoading, error, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const openDialog = (emp = null) => {
    setCurrentEmployee(emp);
    setDialogOpen(true);
  };

  const saveEmployee = (emp) => {
    emp.id ? updateEmployee(emp) : addEmployee(emp);
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" /> Add Employee
          </Button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

        <EmployeeTable employees={employees} isLoading={isLoading} onEdit={openDialog} onDelete={deleteEmployee} />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{currentEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
              <DialogDescription>
                {currentEmployee ? 'Update this employee.' : 'Add a new employee.'}
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm employee={currentEmployee} onSave={saveEmployee} onCancel={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
