// --- Employee ---
export interface EmployeeDto {
  uuid: string;
  name: string;
}

// --- Admin Events ---
export interface AdminEventDto {
  uuid: string;
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

export interface CreateEventBody {
  name: string;
  dateTime: string;
  postalCode: string;
  deadline: string;
  capacity: number;
  handlerUuid: string;
}

// --- Trend ---
export interface TrendRowDto {
  date: string;
  newRegistrationCount: number;
  registrationCount: number;
}

export type GetEventTrendResponse = TrendRowDto[];

// --- Public Events ---
export interface PublicEventDto {
  uuid: string;
  name: string;
  dateTime: string;
  address: string;
}

export type GetPublicEventsResponse = PublicEventDto[];

// --- Registration ---
export interface RegisterBody {
  eventUuid: string;
  emailAddress: string;
}

export interface RegisterResponse {
  registrationNo: string;
}
