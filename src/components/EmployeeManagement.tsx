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
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-6 py-4 rounded-xl mb-6 flex justify-between items-start shadow-lg backdrop-blur-sm">
    <div className="flex items-start space-x-3">
      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <h4 className="font-inter font-semibold text-sm mb-1">Error Occurred</h4>
        <p className="text-sm font-inter">{message}</p>
      </div>
    </div>
    <button onClick={onClose} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors ml-4 flex-shrink-0">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
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
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to fetch employees (${res.status}): ${errorData || res.statusText}`);
      }
      setEmployees(await res.json());
    } catch (e) {
      const message = (e as Error).message;
      setError(message);
      toast({
        variant: "destructive",
        title: "Fetch Failed",
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
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to add employee (${res.status}): ${errorData || res.statusText}`);
      }
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
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to update employee (${res.status}): ${errorData || res.statusText}`);
      }
      const updated = await res.json();
      setEmployees((prev) => prev.map((e) => (e.email === emp.email ? updated : e)));
    }, 'Employee updated successfully');

  const deleteEmployee = (email: string) =>
    wrap(async () => {
      const res = await fetch(`${base}/${encodeURIComponent(email)}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to delete employee (${res.status}): ${errorData || res.statusText}`);
      }
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
            <TableCell colSpan={5} className="text-center py-12">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-600 dark:text-slate-400 font-inter">Loading employees...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : employees.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-12">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-inter">No employees found. Start by adding your first team member!</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
<<<<<<< HEAD
          employees.map((emp) => (
=======
          employees.map((emp, index) => (
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
            <TableRow key={emp.id} className="border-slate-200 dark:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all duration-200">
              <TableCell className="font-inter font-medium text-slate-900 dark:text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <span>{emp.name}</span>
                </div>
              </TableCell>
              <TableCell className="font-inter text-slate-600 dark:text-slate-400">{emp.email}</TableCell>
              <TableCell className="font-inter text-slate-600 dark:text-slate-400">{emp.role}</TableCell>
              <TableCell>
<<<<<<< HEAD
                <Badge
                  variant={emp.status === 'Active' ? 'default' : 'secondary'}
                  className={emp.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 font-inter font-medium dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700'
=======
                <Badge 
                  variant={emp.status === 'Active' ? 'default' : 'secondary'} 
                  className={emp.status === 'Active' 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 font-inter font-medium dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700' 
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
                    : 'bg-slate-100 text-slate-700 border-slate-200 font-inter font-medium dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                  }
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                  {emp.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
<<<<<<< HEAD
                  <Button
                    variant="outline"
                    size="sm"
=======
                  <Button 
                    variant="outline" 
                    size="sm" 
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
                    onClick={() => onEdit(emp)}
                    className="font-inter font-medium border-slate-300 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 dark:border-slate-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteConfirm(emp.email, emp.name)}
                    className="font-inter font-medium bg-red-600 hover:bg-red-700 text-white"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </Button>
                </div>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Name Field */}
        <div className="space-y-3">
          <Label className="text-sm font-inter font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Full Name
          </Label>
<<<<<<< HEAD
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
=======
          <Input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
            placeholder="Enter employee's full name"
            className="font-inter bg-white/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-300"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-3">
          <Label className="text-sm font-inter font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Address
          </Label>
<<<<<<< HEAD
          <Input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
=======
          <Input 
            name="email" 
            type="email"
            value={form.email} 
            onChange={handleChange} 
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
            placeholder="employee@company.com"
            className="font-inter bg-white/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-300"
          />
        </div>

        {/* Role Field */}
        <div className="space-y-3">
          <Label className="text-sm font-inter font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2V8" />
            </svg>
            Job Role
          </Label>
<<<<<<< HEAD
          <Input
            name="role"
            value={form.role}
            onChange={handleChange}
=======
          <Input 
            name="role" 
            value={form.role} 
            onChange={handleChange} 
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
            placeholder="e.g., Software Engineer, Product Manager"
            className="font-inter bg-white/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-300"
          />
        </div>

        {/* Status Field */}
        <div className="space-y-3">
          <Label className="text-sm font-inter font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Employment Status
          </Label>
          <Select
            value={form.status}
            onValueChange={(val) => setForm({ ...form, status: val as any })}
          >
            <SelectTrigger className="font-inter bg-white/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-300">
              <SelectValue placeholder="Select employment status" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-300 dark:border-slate-600">
              <SelectItem value="Active" className="font-inter focus:bg-indigo-50 dark:focus:bg-indigo-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Active
                </div>
              </SelectItem>
              <SelectItem value="Inactive" className="font-inter focus:bg-slate-50 dark:focus:bg-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  Inactive
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
<<<<<<< HEAD

      <DialogFooter className="gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button
          onClick={onCancel}
          variant="outline"
=======
      
      <DialogFooter className="gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button 
          onClick={onCancel}
          variant="outline" 
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
          className="font-inter font-medium border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 px-6"
        >
          Cancel
        </Button>
<<<<<<< HEAD
        <Button
=======
        <Button 
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
          onClick={handleSubmit}
          className="font-inter font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {employee ? 'Update Employee' : 'Save Employee'}
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
<<<<<<< HEAD
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    email: string;
    name: string;
  }>({ open: false, email: '', name: '' });

  const [searchTerm, setSearchTerm] = useState('');

  // Filter employees by search term (name or role)
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
=======
  const [deleteDialog, setDeleteDialog] = useState<{ 
    open: boolean; 
    email: string; 
    name: string; 
  }>({ open: false, email: '', name: '' });
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <header className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-playfair font-bold tracking-tight">Company Dashboard</h1>
                <p className="text-white/80 text-sm font-inter">Manage your workforce with elegance</p>
              </div>
            </div>
            <Button variant="secondary" onClick={goToLogin} className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm font-medium px-6">
              Login
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

<<<<<<< HEAD
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
=======
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
            <div className="space-y-2">
              <h2 className="text-4xl font-playfair font-bold text-slate-900 dark:text-white tracking-tight">Employee Management</h2>
              <p className="text-slate-600 dark:text-slate-400 font-inter">Streamline your team operations</p>
            </div>
<<<<<<< HEAD
            <div className="flex items-center space-x-4 w-full max-w-sm">
              <input
                type="text"
                placeholder="Search by name or department"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white font-inter focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Employee
              </Button>
            </div>
=======
            <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Employee
            </Button>
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
          </div>

          <EmployeeTable
            employees={filteredEmployees}
            isLoading={loading}
            onEdit={(emp) => {
              setCurrentEmployee(emp);
              setDialogOpen(true);
            }}
            onDeleteConfirm={handleDeleteConfirm}
          />

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 max-w-lg">
              <DialogHeader className="text-left space-y-3">
                <DialogTitle className="text-2xl font-playfair font-bold text-slate-900 dark:text-white">
                  {currentEmployee ? 'Edit Employee' : 'Add New Employee'}
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400 font-inter">
                  {currentEmployee ? 'Update the employee information below.' : 'Fill in the details to add a new team member.'}
                </DialogDescription>
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

<<<<<<< HEAD
          <AlertDialog open={deleteDialog.open} onOpenChange={(open) =>
=======
          <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
            setDeleteDialog({ ...deleteDialog, open })
          }>
            <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-red-200/50 dark:ring-red-700/50">
              <AlertDialogHeader className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <AlertDialogTitle className="text-xl font-playfair font-bold text-slate-900 dark:text-white">
                  Delete Employee
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600 dark:text-slate-400 font-inter">
                  Are you sure you want to delete <strong className="font-semibold text-slate-900 dark:text-white">"{deleteDialog.name}"</strong>? This action cannot be undone and will permanently remove all employee data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="font-inter font-medium border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
                  Cancel
                </AlertDialogCancel>
<<<<<<< HEAD
                <AlertDialogAction
=======
                <AlertDialogAction 
>>>>>>> 69049b30e7972e77c25c393f438794e700f242f5
                  onClick={handleDeleteExecute}
                  className="bg-red-600 hover:bg-red-700 text-white font-inter font-medium"
                >
                  Yes, Delete Employee
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>

      <footer className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-6 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
            </div>
            <p className="text-white/80 font-inter text-sm">
              © {new Date().getFullYear()} My Company. Crafted with excellence for modern workforce management.
            </p>
            <div className="flex justify-center space-x-6 text-xs text-white/60">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmployeeManagement;
