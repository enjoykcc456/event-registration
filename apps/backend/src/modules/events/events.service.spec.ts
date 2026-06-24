import { ErrorCode } from "@common/types";
import { ClientError, ValidationError } from "../../errors";
import { Employee } from "../../models/employee.model";
import { Event } from "../../models/event.model";
import {
  createEvent,
  getHandlerOpenEventCount,
  isEventOpen,
  listEvents,
  listOpenEvents,
} from "./events.service";
import * as onemapService from "../onemap/onemap.service";

jest.mock("../../models/event.model");
jest.mock("../../models/employee.model");
jest.mock("../../models/registration.model");
jest.mock("../onemap/onemap.service");

const mockResolvePostalCode = onemapService.resolvePostalCode as jest.Mock;

function createMockEvent(overrides: Record<string, unknown> = {}): Event {
  const defaults: Record<string, unknown> = {
    uuid: "evt-uuid-1",
    name: "Test Event",
    dateTime: new Date("2030-12-01T10:00:00Z"),
    address: "123 Test St",
    deadline: new Date("2030-11-30T10:00:00Z"),
    capacity: 100,
    handlerUuid: "handler-uuid-1",
    createdAt: new Date("2024-01-01"),
    registrationCount: 0,
    handler: { uuid: "handler-uuid-1", name: "John" },
  };

  const data: Record<string, unknown> = { ...defaults, ...overrides };
  return {
    ...data,
    getDataValue: (key: string) => data[key],
  } as unknown as Event;
}

describe("events.service", () => {
  describe("isEventOpen", () => {
    it("should return true when deadline is in future and capacity not reached", () => {
      const event = createMockEvent({
        deadline: new Date("2030-12-01"),
        capacity: 100,
        registrationCount: 50,
      });
      expect(isEventOpen(event)).toBe(true);
    });

    it("should return false when deadline has passed", () => {
      const event = createMockEvent({
        deadline: new Date("2020-01-01"),
        capacity: 100,
        registrationCount: 0,
      });
      expect(isEventOpen(event)).toBe(false);
    });

    it("should return false when capacity is full", () => {
      const event = createMockEvent({
        deadline: new Date("2030-12-01"),
        capacity: 10,
        registrationCount: 10,
      });
      expect(isEventOpen(event)).toBe(false);
    });

    it("should return false when capacity exceeded", () => {
      const event = createMockEvent({
        deadline: new Date("2030-12-01"),
        capacity: 5,
        registrationCount: 6,
      });
      expect(isEventOpen(event)).toBe(false);
    });
  });

  describe("getHandlerOpenEventCount", () => {
    it("should count open events for a handler", async () => {
      const openEvent = createMockEvent({
        deadline: new Date("2030-12-01"),
        capacity: 100,
        registrationCount: 5,
      });
      const closedEvent = createMockEvent({
        deadline: new Date("2020-01-01"),
        capacity: 100,
        registrationCount: 5,
      });

      (Event.findAll as jest.Mock).mockResolvedValue([openEvent, closedEvent]);

      const count = await getHandlerOpenEventCount("handler-uuid-1");
      expect(count).toBe(1);
    });

    it("should exclude specific event when excludeEventUuid provided", async () => {
      (Event.findAll as jest.Mock).mockResolvedValue([]);

      await getHandlerOpenEventCount("handler-uuid-1", "exclude-uuid");
      expect(Event.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            handlerUuid: "handler-uuid-1",
          }),
        }),
      );
    });
  });

  describe("listEvents", () => {
    it("should return paginated events with total count", async () => {
      const mockEvent = createMockEvent();
      (Event.findAndCountAll as jest.Mock).mockResolvedValue({
        count: [{ count: 1 }],
        rows: [mockEvent],
      });

      const result = await listEvents(1, undefined, false);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].uuid).toBe("evt-uuid-1");
      expect(result.events[0].registrationCount).toBe(0);
    });

    it("should filter by search term", async () => {
      (Event.findAndCountAll as jest.Mock).mockResolvedValue({
        count: [],
        rows: [],
      });

      await listEvents(1, "test", false);
      expect(Event.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
        }),
      );
    });

    it("should filter open events only when openOnly is true", async () => {
      const openEvent = createMockEvent({
        uuid: "open",
        deadline: new Date("2030-12-01"),
        capacity: 100,
        registrationCount: 5,
      });
      const closedEvent = createMockEvent({
        uuid: "closed",
        deadline: new Date("2020-01-01"),
        capacity: 100,
        registrationCount: 5,
      });

      (Event.findAndCountAll as jest.Mock).mockResolvedValue({
        count: [{ count: 1 }, { count: 1 }],
        rows: [openEvent, closedEvent],
      });

      const result = await listEvents(1, undefined, true);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].uuid).toBe("open");
    });
  });

  describe("listOpenEvents", () => {
    it("should return only events that are open for registration", async () => {
      const openEvent = createMockEvent({
        uuid: "open-1",
        deadline: new Date("2030-12-01"),
        capacity: 100,
        registrationCount: 5,
      });
      const closedEvent = createMockEvent({
        uuid: "closed-1",
        deadline: new Date("2020-01-01"),
        capacity: 100,
        registrationCount: 0,
      });

      (Event.findAll as jest.Mock).mockResolvedValue([openEvent, closedEvent]);

      const result = await listOpenEvents();
      expect(result).toHaveLength(1);
      expect(result[0].uuid).toBe("open-1");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("dateTime");
      expect(result[0]).toHaveProperty("address");
      expect(result[0]).toHaveProperty("deadline");
    });
  });

  describe("createEvent", () => {
    const validPayload = {
      name: "New Event",
      dateTime: "2030-12-01T10:00:00Z",
      postalCode: "123456",
      deadline: "2030-11-30T10:00:00Z",
      capacity: 50,
      handlerUuid: "handler-uuid-1",
    };

    beforeEach(() => {
      (Event.findOne as jest.Mock).mockResolvedValue(null);
      (Employee.findByPk as jest.Mock).mockResolvedValue({
        uuid: "handler-uuid-1",
        name: "John",
      });
      (Event.findAll as jest.Mock).mockResolvedValue([]);
      (Event.create as jest.Mock).mockResolvedValue({});
      mockResolvePostalCode.mockResolvedValue("123 RESOLVED ST");
    });

    it("should create event successfully with valid data", async () => {
      await expect(createEvent(validPayload)).resolves.toBeUndefined();
      expect(Event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Event",
          address: "123 RESOLVED ST",
          capacity: 50,
          handlerUuid: "handler-uuid-1",
        }),
      );
    });

    it("should throw ValidationError if deadline is not before dateTime", async () => {
      await expect(
        createEvent({
          ...validPayload,
          deadline: "2030-12-02T10:00:00Z",
          dateTime: "2030-12-01T10:00:00Z",
        }),
      ).rejects.toThrow(ValidationError);
      await expect(
        createEvent({
          ...validPayload,
          deadline: "2030-12-02T10:00:00Z",
          dateTime: "2030-12-01T10:00:00Z",
        }),
      ).rejects.toThrow("deadline must be before dateTime");
    });

    it("should throw ClientError if event name already exists", async () => {
      (Event.findOne as jest.Mock).mockResolvedValue({ name: "New Event" });

      await expect(createEvent(validPayload)).rejects.toThrow(ClientError);
      await expect(createEvent(validPayload)).rejects.toThrow(
        'Event name "New Event" already exists',
      );
    });

    it("should throw ClientError if handler employee not found", async () => {
      (Employee.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(createEvent(validPayload)).rejects.toThrow(ClientError);
      await expect(createEvent(validPayload)).rejects.toThrow(
        "Handler employee not found",
      );
    });

    it("should throw ClientError if handler already has an open event", async () => {
      const openEvent = createMockEvent({
        deadline: new Date("2030-12-01"),
        capacity: 100,
        registrationCount: 5,
      });
      (Event.findAll as jest.Mock).mockResolvedValue([openEvent]);

      await expect(createEvent(validPayload)).rejects.toThrow(ClientError);
      await expect(createEvent(validPayload)).rejects.toThrow(
        "Handler already has an open event",
      );
    });

    it("should throw ValidationError if postal code cannot be resolved", async () => {
      mockResolvePostalCode.mockRejectedValue(
        new ValidationError(
          ErrorCode.POSTAL_CODE_NOT_FOUND,
          "No address found for postal code: 999999",
        ),
      );

      await expect(
        createEvent({ ...validPayload, postalCode: "999999" }),
      ).rejects.toThrow(ValidationError);
    });
  });
});
