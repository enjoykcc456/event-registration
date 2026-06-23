import { Op, WhereOptions, col, fn } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { ValidationError } from "../../errors";
import { Employee } from "../../models/employee.model";
import { Event } from "../../models/event.model";
import { Registration } from "../../models/registration.model";
import { resolvePostalCode } from "../onemap/onemap.service";
import { CreateEventBody } from "@common/types";
import { ListEventsResult, OpenEvent } from "./events.typing";

const PAGE_SIZE = 10;

/**
 * Extracts the virtual registrationCount column from a query result.
 *
 * @param {Event} event - The event instance with aggregated registration count.
 * @returns {number} The parsed registration count.
 */
function getRegistrationCount(event: Event): number {
  const value = event.getDataValue("registrationCount" as keyof Event);
  return parseInt(String(value ?? 0), 10);
}

/**
 * Checks whether an event is still open for registration.
 * An event is open if the deadline has not passed and capacity is not full.
 *
 * @param {Event} event - The event instance with aggregated registration count.
 * @returns {boolean} True if event is accepting registrations.
 */
export function isEventOpen(event: Event): boolean {
  const count = getRegistrationCount(event);
  return event.deadline > new Date() && count < event.capacity;
}

/**
 * Returns the number of currently open events assigned to a handler.
 *
 * @param {string} handlerUuid - The handler employee's UUID.
 * @param {string} [excludeEventUuid] - Optional event UUID to exclude from the count.
 * @returns {Promise<number>} The number of open events for this handler.
 */
export async function getHandlerOpenEventCount(
  handlerUuid: string,
  excludeEventUuid?: string,
): Promise<number> {
  const where: Record<string, unknown> = { handlerUuid };
  if (excludeEventUuid) {
    where["uuid"] = { [Op.ne]: excludeEventUuid };
  }

  const events = await Event.findAll({
    where,
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

  return events.filter((e) => isEventOpen(e)).length;
}

/**
 * Returns a paginated list of events with optional search and open-only filtering.
 *
 * @param {number} page - The page number (1-based).
 * @param {string | undefined} search - Optional search term to filter by name, address, or handler name.
 * @param {boolean} openOnly - If true, only returns events that are still open for registration.
 * @returns {Promise<ListEventsResult>} Paginated event list with total count.
 */
export async function listEvents(
  page: number,
  search: string | undefined,
  openOnly: boolean,
): Promise<ListEventsResult> {
  const where: WhereOptions = {};

  if (search) {
    const like = { [Op.like]: `%${search}%` };
    where[Op.or as unknown as string] = [
      { name: like },
      { address: like },
      { "$handler.name$": like },
    ];
  }

  const { count, rows } = await Event.findAndCountAll({
    where,
    include: [
      { model: Employee, as: "handler" },
      { model: Registration, attributes: [] },
    ],
    attributes: [
      "uuid",
      "name",
      "dateTime",
      "address",
      "deadline",
      "capacity",
      "handlerUuid",
      "createdAt",
      [fn("COUNT", col("registrations.uuid")), "registrationCount"],
    ],
    group: ["Event.uuid", "handler.uuid"],
    subQuery: false,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    order: [["createdAt", "DESC"]],
  });

  const events = rows
    .map((e) => ({
      uuid: e.uuid,
      createdAt: e.createdAt,
      name: e.name,
      dateTime: e.dateTime,
      address: e.address,
      deadline: e.deadline,
      capacity: e.capacity,
      registrationCount: getRegistrationCount(e),
      handler: e.handler,
      isOpen: isEventOpen(e),
    }))
    .filter((e) => !openOnly || e.isOpen);

  return { total: (count as unknown as unknown[]).length ?? count, events };
}

/**
 * Returns all events that are currently open for public registration.
 *
 * @returns {Promise<OpenEvent[]>} List of open events with uuid, name, dateTime, and address.
 */
export async function listOpenEvents(): Promise<OpenEvent[]> {
  const events = await Event.findAll({
    include: [{ model: Registration, attributes: [] }],
    attributes: [
      "uuid",
      "name",
      "dateTime",
      "address",
      "deadline",
      "capacity",
      [fn("COUNT", col("registrations.uuid")), "registrationCount"],
    ],
    group: ["Event.uuid"],
    subQuery: false,
  });

  return events
    .filter((e) => isEventOpen(e))
    .map((e) => ({
      uuid: e.uuid,
      name: e.name,
      dateTime: e.dateTime,
      address: e.address,
      deadline: e.deadline,
    }));
}

/**
 * Creates a new event after validating business rules.
 * Checks unique name, handler open-event limit, and resolves postal code to address.
 *
 * @param {CreateEventBody} data - The event creation payload.
 * @returns {Promise<void>}
 * @throws {ValidationError} If deadline is not before dateTime.
 * @throws {ValidationError} If event name already exists.
 * @throws {ValidationError} If handler employee not found.
 * @throws {ValidationError} If handler already has an open event.
 * @throws {ValidationError} If postal code cannot be resolved.
 */
export async function createEvent(data: CreateEventBody): Promise<void> {
  const { name, dateTime, postalCode, deadline, capacity, handlerUuid } = data;

  if (new Date(deadline) >= new Date(dateTime)) {
    throw new ValidationError("deadline must be before dateTime");
  }

  const existing = await Event.findOne({ where: { name } });
  if (existing) {
    throw new ValidationError(`Event name "${name}" already exists`);
  }

  const handler = await Employee.findByPk(handlerUuid);
  if (!handler) {
    throw new ValidationError("Handler employee not found");
  }

  const openCount = await getHandlerOpenEventCount(handlerUuid);
  if (openCount >= 1) {
    throw new ValidationError("Handler already has an open event");
  }

  const address = await resolvePostalCode(postalCode);

  await Event.create({
    uuid: uuidv4(),
    name,
    dateTime: new Date(dateTime),
    address,
    deadline: new Date(deadline),
    capacity,
    handlerUuid,
  });
}
