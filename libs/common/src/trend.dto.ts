export interface TrendRowDto {
  date: string;
  newRegistrationCount: number;
  registrationCount: number;
}

export type GetEventTrendResponse = TrendRowDto[];
