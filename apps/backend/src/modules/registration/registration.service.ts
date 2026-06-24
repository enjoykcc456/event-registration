import { col, fn } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import sequelize from "../../config/database.config";
import { ErrorCode } from "@common/types";
import { ClientError } from "../../errors";
import { Event } from "../../models/event.model";
import { Registration } from "../../models/registration.model";
import { isEventOpen } from "../events/events.service";
import { RegisterResponse } from "@common/types";

/**
 * Generates the next sequential 5-digit registration number for an event.
 * Uses a DB transaction lock to prevent race conditions.
 *
 * @param {string} eventUuid - The event UUID to generate a registration number for.
 * @returns {Promise<string>} The zero-padded 5-digit registration number.
 */
async function generateRegistrationNo(eventUuid: string): Promise<string> {
  return sequelize.transaction(async (t) => {
    const last = await Registration.findOne({
      where: { eventUuid },
      order: [["registrationNo", "DESC"]],
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    const next = last ? parseInt(last.registrationNo, 10) + 1 : 1;
    return next.toString().padStart(5, "0");
  });
}

/**
 * Registers a user for an event.
 * Validates the event exists and is open, then assigns a sequential registration number.
 *
 * @param {string} eventUuid - The UUID of the event to register for.
 * @param {string} emailAddress - The registrant's email address.
 * @returns {Promise<RegisterResponse>} The assigned registration number.
 * @throws {ClientError} If the event is not found.
 * @throws {ClientError} If the event is not open for registration.
 */
export async function register(
  eventUuid: string,
  emailAddress: string,
): Promise<RegisterResponse> {
  const event = await Event.findOne({
    where: { uuid: eventUuid },
    include: [{ model: Registration, attributes: [] }],
    attributes: [
      "uuid",
      "deadline",
      "capacity",
      [fn("COUNT", col("registrations.uuid")), "registrationCount"],
    ],
    group: ["Event.uuid"],
    subQuery: false,
  });

  if (!event) {
    throw new ClientError(ErrorCode.EVENT_NOT_FOUND, "Event not found");
  }

  if (!isEventOpen(event)) {
    throw new ClientError(ErrorCode.EVENT_NOT_OPEN, "Event is not open for registration");
  }

  const registrationNo = await generateRegistrationNo(eventUuid);

  await Registration.create({
    uuid: uuidv4(),
    eventUuid,
    emailAddress,
    registrationNo,
  });

  return { registrationNo };
}
