import { col, fn } from "sequelize";
import { ErrorCode } from "@common/types";
import { ClientError } from "../../errors";
import { Event } from "../../models/event.model";
import { Registration } from "../../models/registration.model";
import { TrendRowDto } from "@common/types";

/**
 * Calculates daily registration trend from event creation to deadline.
 * Returns cumulative and new registration counts per day.
 *
 * @param {string} eventUuid - The UUID of the event to calculate trends for.
 * @returns {Promise<TrendRowDto[]>} Array of daily trend rows with date, newRegistrationCount, and registrationCount.
 * @throws {ClientError} If the event is not found.
 */
export async function calculateTrend(eventUuid: string): Promise<TrendRowDto[]> {
  const event = await Event.findByPk(eventUuid);
  if (!event) {
    throw new ClientError(ErrorCode.EVENT_NOT_FOUND, "Event not found");
  }

  const start = new Date(event.createdAt as unknown as Date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(event.deadline);
  end.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  const registrations = await Registration.findAll({
    where: { eventUuid },
    attributes: [
      [fn("DATE", col("createdAt")), "date"],
      [fn("COUNT", col("uuid")), "count"],
    ],
    group: [fn("DATE", col("createdAt"))],
    raw: true,
  });

  const countByDate = new Map<string, number>();
  for (const row of registrations as unknown as Array<{
    date: string;
    count: string;
  }>) {
    countByDate.set(row.date, parseInt(row.count, 10));
  }

  let runningTotal = 0;
  return dates.map((date) => {
    const newRegistrationCount = countByDate.get(date) ?? 0;
    runningTotal += newRegistrationCount;
    return { date, newRegistrationCount, registrationCount: runningTotal };
  });
}
