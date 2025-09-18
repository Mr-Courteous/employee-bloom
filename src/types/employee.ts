export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  department: string;
  role: string;
}

export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
] as const;

export type Department = typeof DEPARTMENTS[number];