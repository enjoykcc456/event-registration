import { Employee } from "../../models/employee.model";

export interface ListEventsResult {
  total: number;
  events: Array<{
    uuid: string;
    createdAt: Date;
    name: string;
    dateTime: Date;
    address: string;
    deadline: Date;
    capacity: number;
    registrationCount: number;
    handler: Employee;
    isOpen: boolean;
  }>;
}

export interface OpenEvent {
  uuid: string;
  name: string;
  dateTime: Date;
  address: string;
}

