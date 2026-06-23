import type { CreateEventBody } from "@common/types";
import type {
  EmployeeDto,
  GetAdminEventsQuery,
  GetAdminEventsResponse,
  GetEventTrendResponse,
} from "../types/admin";
import client from "./client";

export async function getEvents(
  params: GetAdminEventsQuery,
): Promise<GetAdminEventsResponse> {
  const { data } = await client.get<GetAdminEventsResponse>(
    "/api/admin/events",
    { params },
  );
  return data;
}

export async function createEvent(body: CreateEventBody): Promise<void> {
  await client.post("/api/admin/events", body);
}

export async function getEventTrend(
  uuid: string,
): Promise<GetEventTrendResponse> {
  const { data } = await client.post<GetEventTrendResponse>(
    `/api/admin/events/${uuid}/trend`,
  );
  return data;
}

export async function getEmployees(): Promise<EmployeeDto[]> {
  const { data } = await client.get<EmployeeDto[]>("/api/admin/employees");
  return data;
}
