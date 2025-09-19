'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// =======================
// Types
// =======================
interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
}

// =======================
// Small helpers
// =======================
const ErrorBanner = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="bg-destructive/15 text-destructive px-4 py-3 rounded mb-4 flex justify-between">
    <span>{message}</span>
    <button onClick={onClose} className="font-bold">×</button>
  </div>
);

// =======================
// Hook for API sync
// =======================
const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const base = 'http://localhost:5000/api/users';

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(base);
      if (!res.ok) throw new Error('Unable to fetch employees.');
      setEmployees(await res.json());
    } catch (e) {
      const message = (e as Error).message;
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const wrap = async <T,>(fn: () => Promise<T>, successMessage?: string) => {
    try {
      const result = await fn();
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      return result;
    } catch (e) {
      const message = (e as Error).message;
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
      throw e;
    }
  };

  const addEmployee = (emp: Employee) =>
    wrap(async () => {
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp),
      });
      if (!res.ok) throw new Error('Failed to add employee.');
      const created = await res.json();
      setEmployees((prev) => [...prev, created]);
    }, 'Employee added successfully');

  const updateEmployee = (emp: Employee) =>
    wrap(async () => {
      const res = await fetch(`${base}/${encodeURIComponent(emp.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp),
      });
      if (!res.ok) throw new Error('Failed to update employee.');
      const updated = await res.json();
      setEmployees((prev) => prev.map((e) => (e.email === emp.email ? updated : e)));
    }, 'Employee updated successfully');

  const deleteEmployee = (email: string) =>
    wrap(async () => {
      const res = await fetch(`${base}/${encodeURIComponent(email)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete employee.');
      setEmployees((prev) => prev.filter((e) => e.email !== email));
    }, 'Employee deleted successfully');

  return { employees, loading, error, setError, addEmployee, updateEmployee, deleteEmployee };
};

// =======================
// Employee Table
// =======================
const EmployeeTable = ({
  employees,
  isLoading,
  onEdit,
  onDeleteConfirm,
}: {
  employees: Employee[];
  isLoading: boolean;
  onEdit: (e: Employee) => void;
  onDeleteConfirm: (email: string, name: string) => void;
}) => (
  <Card className="overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              Loading…
            </TableCell>
          </TableRow>
        ) : employees.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No employees found.
            </TableCell>
          </TableRow>
        ) : (
          employees.map((emp) => (
            <TableRow key={emp.id}>
              <TableCell>{emp.name}</TableCell>
              <TableCell>{emp.email}</TableCell>
              <TableCell>{emp.role}</TableCell>
              <TableCell>
                <Badge variant={emp.status === 'Active' ? 'default' : 'secondary'}>
                  {emp.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(emp)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteConfirm(emp.email, emp.name)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </Card>
);

// =======================
// Employee Form
// =======================
const EmployeeForm = ({
  employee,
  onSave,
  onCancel,
}: {
  employee: Employee | null;
  onSave: (e: Employee) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<Employee>(
    employee ?? { id: 0, name: '', email: '', role: '', status: 'Active' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => onSave(form);

  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input name="name" value={form.name} onChange={handleChange} />
      </div>
      <div>
        <Label>Email</Label>
        <Input name="email" value={form.email} onChange={handleChange} />
      </div>
      <div>
        <Label>Role</Label>
        <Input name="role" value={form.role} onChange={handleChange} />
      </div>
      <div>
        <Label>Status</Label>
        <Select
          value={form.status}
          onValueChange={(val) => setForm({ ...form, status: val as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit}>Save</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </div>
  );
};

// =======================
// Main Component
// =======================
const EmployeeManagement = () => {
  const {
    employees,
    loading,
    error,
    setError,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ 
    open: boolean; 
    email: string; 
    name: string; 
  }>({ open: false, email: '', name: '' });

  const handleSave = async (emp: Employee) => {
    try {
      if (emp.id) await updateEmployee(emp);
      else await addEmployee(emp);
      setDialogOpen(false);
      setCurrentEmployee(null);
    } catch {
      /* error already handled in hook */
    }
  };

  const handleDeleteConfirm = (email: string, name: string) => {
    setDeleteDialog({ open: true, email, name });
  };

  const handleDeleteExecute = async () => {
    try {
      await deleteEmployee(deleteDialog.email);
      setDeleteDialog({ open: false, email: '', name: '' });
    } catch {
      /* error already handled in hook */
    }
  };

  const goToLogin = () => (window.location.href = '/login');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Company Dashboard</h1>
          <Button variant="secondary" onClick={goToLogin}>
            Login
          </Button>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Employee Management</h2>
            <Button onClick={() => setDialogOpen(true)}>Add Employee</Button>
          </div>

          <EmployeeTable
            employees={employees}
            isLoading={loading}
            onEdit={(emp) => {
              setCurrentEmployee(emp);
              setDialogOpen(true);
            }}
            onDeleteConfirm={handleDeleteConfirm}
          />

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                <DialogDescription>Fill in the details for the employee.</DialogDescription>
              </DialogHeader>
              <EmployeeForm
                employee={currentEmployee}
                onSave={handleSave}
                onCancel={() => {
                  setDialogOpen(false);
                  setCurrentEmployee(null);
                }}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
            setDeleteDialog({ ...deleteDialog, open })
          }>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the employee "{deleteDialog.name}" and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteExecute}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>

      <footer className="bg-muted p-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} My Company. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default EmployeeManagement;
