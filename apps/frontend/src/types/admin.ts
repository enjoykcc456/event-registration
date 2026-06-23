import { TrendRowDto } from "@common/types";

export interface EmployeeDto {
  uuid: string;
  name: string;
}

export interface AdminEventDto {
  uuid: string;
  createdAt: string;
  name: string;
  dateTime: string;
  address: string;
  deadline: string;
  capacity: number;
  registrationCount: number;
  handler: EmployeeDto;
  isOpen: boolean;
}

export interface GetAdminEventsQuery {
  page?: number;
  search?: string;
  open?: string;
}

export interface GetAdminEventsResponse {
  total: number;
  events: AdminEventDto[];
}

export type GetEventTrendResponse = TrendRowDto[];
