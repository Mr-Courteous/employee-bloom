import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmployeeForm } from './EmployeeForm';
import { EmployeeTable } from './EmployeeTable';
import { Employee, EmployeeFormData, DEPARTMENTS } from '@/types/employee';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Filter, Users } from 'lucide-react';

// Mock data for demonstration
const initialEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    department: 'Design',
    role: 'UI/UX Designer',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    department: 'Product',
    role: 'Product Manager',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david.thompson@company.com',
    department: 'Marketing',
    role: 'Marketing Specialist',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
];

export const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  // Filter employees based on search term and department
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = 
        departmentFilter === 'all' || employee.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  }, [employees, searchTerm, departmentFilter]);

  const handleAddEmployee = async (formData: EmployeeFormData) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setEmployees(prev => [newEmployee, ...prev]);
    setIsFormOpen(false);
    setIsLoading(false);
    
    toast({
      title: 'Employee Added',
      description: `${formData.name} has been successfully added to the team.`,
    });
  };

  const handleEditEmployee = async (formData: EmployeeFormData) => {
    if (!editingEmployee) return;
    
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const updatedEmployee: Employee = {
      ...editingEmployee,
      ...formData,
      updatedAt: new Date(),
    };
    
    setEmployees(prev => 
      prev.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp)
    );
    
    setEditingEmployee(null);
    setIsFormOpen(false);
    setIsLoading(false);
    
    toast({
      title: 'Employee Updated',
      description: `${formData.name}'s information has been updated successfully.`,
    });
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    
    toast({
      title: 'Employee Deleted',
      description: `${employee?.name} has been removed from the team.`,
      variant: 'destructive',
    });
  };

  const openAddForm = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const openEditForm = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  // Get department counts for the overview
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(employee => {
      counts[employee.department] = (counts[employee.department] || 0) + 1;
    });
    return counts;
  }, [employees]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Employee Management
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Streamline your team operations with our modern employee management system
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border shadow-custom-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Users className="h-5 w-5 text-primary" />
                Total Employees
              </CardTitle>
              <CardDescription className="text-3xl font-bold text-primary">
                {employees.length}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-card border-border shadow-custom-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Filter className="h-5 w-5 text-accent" />
                Departments
              </CardTitle>
              <CardDescription className="text-3xl font-bold text-accent">
                {Object.keys(departmentCounts).length}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-card border-border shadow-custom-md">
            <CardHeader>
              <CardTitle className="text-card-foreground">Top Departments</CardTitle>
              <CardDescription className="space-y-2">
                {Object.entries(departmentCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center">
                      <span className="text-sm">{dept}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search employees by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={openAddForm} variant="gradient" size="lg" className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredEmployees.length} of {employees.length} employees
            {departmentFilter !== 'all' && ` in ${departmentFilter}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Employee Table */}
        <EmployeeTable
          employees={filteredEmployees}
          onEdit={openEditForm}
          onDelete={handleDeleteEmployee}
          isLoading={false}
        />
      </div>

      {/* Employee Form Modal */}
      <EmployeeForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
        employee={editingEmployee}
        isLoading={isLoading}
      />
    </div>
  );
};