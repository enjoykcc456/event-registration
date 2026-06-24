import request from "supertest";
import app from "./app";
import { Employee } from "./models/employee.model";
import { Event } from "./models/event.model";
import { Registration } from "./models/registration.model";
import * as onemapService from "./modules/onemap/onemap.service";

jest.mock("./models/event.model");
jest.mock("./models/employee.model");
jest.mock("./models/registration.model");
jest.mock("./modules/onemap/onemap.service");
jest.mock("./config/logger.config", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));
jest.mock("./config/database.config", () => ({
  __esModule: true,
  default: {
    transaction: jest.fn((cb: (t: unknown) => unknown) =>
      cb({ LOCK: { UPDATE: "UPDATE" } }),
    ),
  },
}));

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
    registrationCount: 5,
    handler: { uuid: "handler-uuid-1", name: "John Doe" },
  };

  const data: Record<string, unknown> = { ...defaults, ...overrides };
  return {
    ...data,
    getDataValue: (key: string) => data[key],
  } as unknown as Event;
}

describe("API Integration Tests", () => {
  describe("GET /api/admin/events", () => {
    it("should return 200 with paginated events", async () => {
      const mockEvent = createMockEvent();
      (Event.findAndCountAll as jest.Mock).mockResolvedValue({
        count: [{ count: 1 }],
        rows: [mockEvent],
      });

      const res = await request(app).get("/api/admin/events?page=1");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("events");
      expect(Array.isArray(res.body.events)).toBe(true);
    });

    it("should return 421 when page param is missing", async () => {
      const res = await request(app).get("/api/admin/events");
      expect(res.status).toBe(421);
    });

    it("should return 421 when page is not a valid integer", async () => {
      const res = await request(app).get("/api/admin/events?page=abc");
      expect(res.status).toBe(421);
    });

    it("should accept optional search param", async () => {
      (Event.findAndCountAll as jest.Mock).mockResolvedValue({
        count: [],
        rows: [],
      });

      const res = await request(app).get(
        "/api/admin/events?page=1&search=test",
      );
      expect(res.status).toBe(200);
    });

    it("should accept optional open filter param", async () => {
      (Event.findAndCountAll as jest.Mock).mockResolvedValue({
        count: [],
        rows: [],
      });

      const res = await request(app).get("/api/admin/events?page=1&open=true");
      expect(res.status).toBe(200);
    });

    it("should return events with correct shape", async () => {
      const mockEvent = createMockEvent();
      (Event.findAndCountAll as jest.Mock).mockResolvedValue({
        count: [{ count: 1 }],
        rows: [mockEvent],
      });

      const res = await request(app).get("/api/admin/events?page=1");
      const event = res.body.events[0];

      expect(event).toHaveProperty("uuid");
      expect(event).toHaveProperty("name");
      expect(event).toHaveProperty("dateTime");
      expect(event).toHaveProperty("address");
      expect(event).toHaveProperty("deadline");
      expect(event).toHaveProperty("capacity");
      expect(event).toHaveProperty("registrationCount");
      expect(event).toHaveProperty("handler");
      expect(event.handler).toHaveProperty("uuid");
      expect(event.handler).toHaveProperty("name");
    });
  });

  describe("POST /api/admin/events", () => {
    const validBody = {
      name: "New Event",
      dateTime: "2030-12-01T10:00:00Z",
      postalCode: "123456",
      deadline: "2030-11-30T10:00:00Z",
      capacity: 50,
      handlerUuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    };

    beforeEach(() => {
      (Event.findOne as jest.Mock).mockResolvedValue(null);
      (Employee.findByPk as jest.Mock).mockResolvedValue({
        uuid: validBody.handlerUuid,
        name: "John",
      });
      (Event.findAll as jest.Mock).mockResolvedValue([]);
      (Event.create as jest.Mock).mockResolvedValue({});
      (onemapService.resolvePostalCode as jest.Mock).mockResolvedValue(
        "123 RESOLVED ST",
      );
    });

    it("should return 200 on successful event creation", async () => {
      const res = await request(app).post("/api/admin/events").send(validBody);

      expect(res.status).toBe(200);
    });

    it("should return 421 when name is missing", async () => {
      const res = await request(app)
        .post("/api/admin/events")
        .send({ ...validBody, name: "" });

      expect(res.status).toBe(421);
    });

    it("should return 421 when dateTime is not ISO8601", async () => {
      const res = await request(app)
        .post("/api/admin/events")
        .send({ ...validBody, dateTime: "not-a-date" });

      expect(res.status).toBe(421);
    });

    it("should return 421 when postalCode is not 6 digits", async () => {
      const res = await request(app)
        .post("/api/admin/events")
        .send({ ...validBody, postalCode: "12345" });

      expect(res.status).toBe(421);
    });

    it("should return 421 when capacity is less than 1", async () => {
      const res = await request(app)
        .post("/api/admin/events")
        .send({ ...validBody, capacity: 0 });

      expect(res.status).toBe(421);
    });

    it("should return 421 when handlerUuid is not a UUID", async () => {
      const res = await request(app)
        .post("/api/admin/events")
        .send({ ...validBody, handlerUuid: "not-a-uuid" });

      expect(res.status).toBe(421);
    });

    it("should return 421 when deadline is not before dateTime (business rule)", async () => {
      const res = await request(app)
        .post("/api/admin/events")
        .send({
          ...validBody,
          deadline: "2030-12-02T10:00:00Z",
          dateTime: "2030-12-01T10:00:00Z",
        });

      expect(res.status).toBe(421);
    });

    it("should return 421 when event name already exists", async () => {
      (Event.findOne as jest.Mock).mockResolvedValue({ name: "New Event" });

      const res = await request(app).post("/api/admin/events").send(validBody);

      expect(res.status).toBe(421);
    });

    it("should return 421 when handler already has an open event", async () => {
      const openEvent = createMockEvent({
        deadline: new Date("2030-12-01"),
        capacity: 100,
        registrationCount: 5,
      });
      (Event.findAll as jest.Mock).mockResolvedValue([openEvent]);

      const res = await request(app).post("/api/admin/events").send(validBody);

      expect(res.status).toBe(421);
    });
  });

  describe("GET /api/public/events", () => {
    it("should return 200 with list of open events", async () => {
      const openEvent = createMockEvent({
        deadline: new Date("2030-12-01"),
        capacity: 100,
        registrationCount: 5,
      });
      (Event.findAll as jest.Mock).mockResolvedValue([openEvent]);

      const res = await request(app).get("/api/public/events");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("uuid");
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0]).toHaveProperty("dateTime");
      expect(res.body[0]).toHaveProperty("address");
      expect(res.body[0]).toHaveProperty("deadline");
    });

    it("should not include closed events", async () => {
      const closedEvent = createMockEvent({
        deadline: new Date("2020-01-01"),
      });
      (Event.findAll as jest.Mock).mockResolvedValue([closedEvent]);

      const res = await request(app).get("/api/public/events");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe("POST /api/public/register", () => {
    const validBody = {
      eventUuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      emailAddress: "test@example.com",
    };

    beforeEach(() => {
      const event = createMockEvent({
        uuid: validBody.eventUuid,
        deadline: new Date("2030-12-01"),
        capacity: 100,
        registrationCount: 5,
      });
      (Event.findOne as jest.Mock).mockResolvedValue(event);
      (Registration.findOne as jest.Mock).mockResolvedValue(null);
      (Registration.create as jest.Mock).mockResolvedValue({});
    });

    it("should return 200 with registrationNo on success", async () => {
      const res = await request(app)
        .post("/api/public/register")
        .send(validBody);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("registrationNo");
      expect(res.body.registrationNo).toMatch(/^\d{5}$/);
    });

    it("should return 421 when eventUuid is not a UUID", async () => {
      const res = await request(app)
        .post("/api/public/register")
        .send({ ...validBody, eventUuid: "not-a-uuid" });

      expect(res.status).toBe(421);
    });

    it("should return 421 when emailAddress is invalid", async () => {
      const res = await request(app)
        .post("/api/public/register")
        .send({ ...validBody, emailAddress: "not-an-email" });

      expect(res.status).toBe(421);
    });

    it("should return 400 when event not found", async () => {
      (Event.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/public/register")
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Event not found");
    });

    it("should return 400 when event is not open for registration", async () => {
      const closedEvent = createMockEvent({
        uuid: validBody.eventUuid,
        deadline: new Date("2020-01-01"),
        capacity: 100,
        registrationCount: 5,
      });
      (Event.findOne as jest.Mock).mockResolvedValue(closedEvent);

      const res = await request(app)
        .post("/api/public/register")
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Event is not open for registration",
      );
    });
  });

  describe("POST /api/admin/events/:uuid/trend", () => {
    it("should return 421 when uuid is not a valid UUID", async () => {
      const res = await request(app).post("/api/admin/events/not-a-uuid/trend");
      expect(res.status).toBe(421);
    });

    it("should return 400 when event not found", async () => {
      (Event.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post(
        "/api/admin/events/a1b2c3d4-e5f6-7890-abcd-ef1234567890/trend",
      );

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Event not found");
    });

    it("should return 200 with trend data on success", async () => {
      (Event.findByPk as jest.Mock).mockResolvedValue({
        createdAt: new Date("2024-01-01T00:00:00Z"),
        deadline: new Date("2024-01-02T00:00:00Z"),
      });
      (Registration.findAll as jest.Mock).mockResolvedValue([
        { date: "2024-01-01", count: "3" },
      ]);

      const res = await request(app).post(
        "/api/admin/events/a1b2c3d4-e5f6-7890-abcd-ef1234567890/trend",
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("date");
      expect(res.body[0]).toHaveProperty("newRegistrationCount");
      expect(res.body[0]).toHaveProperty("registrationCount");
    });
  });

  describe("GET /api/admin/employees", () => {
    it("should return 200 with list of employees", async () => {
      (Employee.findAll as jest.Mock).mockResolvedValue([
        { uuid: "emp-1", name: "Alice" },
        { uuid: "emp-2", name: "Bob" },
      ]);

      const res = await request(app).get("/api/admin/employees");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty("uuid");
      expect(res.body[0]).toHaveProperty("name");
    });
  });

  describe("Error handling", () => {
    it("should return 500 for unexpected errors", async () => {
      (Event.findAndCountAll as jest.Mock).mockRejectedValue(
        new Error("DB connection failed"),
      );

      const res = await request(app).get("/api/admin/events?page=1");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Internal server error");
    });
  });
});
