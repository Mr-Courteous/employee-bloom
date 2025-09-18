import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Employee } from '@/types/employee';
import { Edit2, Trash2, Mail, Calendar, User } from 'lucide-react';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
  isLoading?: boolean;
}

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

export const EmployeeTable = ({ employees, onEdit, onDelete, isLoading = false }: EmployeeTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      onDelete(employeeToDelete.id);
    }
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
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
          <p className="text-muted-foreground">Add your first employee to get started with team management.</p>
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
                <TableHead className="font-semibold text-card-foreground">Employee</TableHead>
                <TableHead className="font-semibold text-card-foreground">Department</TableHead>
                <TableHead className="font-semibold text-card-foreground">Role</TableHead>
                <TableHead className="font-semibold text-card-foreground">Joined</TableHead>
                <TableHead className="font-semibold text-card-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow 
                  key={employee.id}
                  className="border-border hover:bg-muted/50 transition-smooth group"
                >
                  <TableCell className="py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="font-medium text-card-foreground">{employee.name}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        {employee.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge 
                      variant="secondary"
                      className={`font-medium ${
                        departmentColors[employee.department as keyof typeof departmentColors] || 
                        departmentColors.Operations
                      }`}
                    >
                      {employee.department}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-medium text-card-foreground">{employee.role}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(employee.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(employee)}
                        className="hover:bg-primary-light hover:text-primary"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(employee)}
                        className="hover:bg-destructive-light hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border shadow-custom-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">Delete Employee</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete <strong>{employeeToDelete?.name}</strong>? 
              This action cannot be undone and will permanently remove their information from the system.
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