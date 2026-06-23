import type { RegisterResponse } from "@common/types";
import type { GetPublicEventsResponse, RegisterBody } from "../types/public";
import client from "./client";

export async function getOpenEvents(): Promise<GetPublicEventsResponse> {
  const { data } =
    await client.get<GetPublicEventsResponse>("/api/public/events");
  return data;
}

export async function register(body: RegisterBody): Promise<RegisterResponse> {
  const { data } = await client.post<RegisterResponse>(
    "/api/public/register",
    body,
  );
  return data;
}
