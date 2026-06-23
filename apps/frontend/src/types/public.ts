export interface PublicEventDto {
  uuid: string;
  name: string;
  dateTime: string;
  address: string;
}

export type GetPublicEventsResponse = PublicEventDto[];

export interface RegisterBody {
  eventUuid: string;
  emailAddress: string;
}
