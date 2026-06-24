import { ClientError } from "../../errors";
import { Event } from "../../models/event.model";
import { Registration } from "../../models/registration.model";
import sequelize from "../../config/database.config";
import { register } from "./registration.service";

jest.mock("../../models/event.model");
jest.mock("../../models/registration.model");
jest.mock("../../config/database.config", () => ({
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
    deadline: new Date("2030-12-01"),
    capacity: 100,
    registrationCount: 5,
  };

  const data: Record<string, unknown> = { ...defaults, ...overrides };
  return {
    ...data,
    getDataValue: (key: string) => data[key],
  } as unknown as Event;
}

describe("registration.service", () => {
  describe("register", () => {
    beforeEach(() => {
      (Registration.findOne as jest.Mock).mockResolvedValue(null);
      (Registration.create as jest.Mock).mockResolvedValue({});
    });

    it("should register successfully for an open event", async () => {
      const event = createMockEvent();
      (Event.findOne as jest.Mock).mockResolvedValue(event);

      const result = await register("evt-uuid-1", "test@example.com");
      expect(result).toHaveProperty("registrationNo");
      expect(result.registrationNo).toBe("00001");
      expect(Registration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventUuid: "evt-uuid-1",
          emailAddress: "test@example.com",
          registrationNo: "00001",
        }),
      );
    });

    it("should generate sequential registration numbers", async () => {
      const event = createMockEvent();
      (Event.findOne as jest.Mock).mockResolvedValue(event);
      (Registration.findOne as jest.Mock).mockResolvedValue({
        registrationNo: "00003",
      });

      const result = await register("evt-uuid-1", "test@example.com");
      expect(result.registrationNo).toBe("00004");
    });

    it("should throw ClientError when event not found", async () => {
      (Event.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        register("nonexistent-uuid", "test@example.com"),
      ).rejects.toThrow(ClientError);
      await expect(
        register("nonexistent-uuid", "test@example.com"),
      ).rejects.toThrow("Event not found");
    });

    it("should throw ClientError when event is not open (deadline passed)", async () => {
      const event = createMockEvent({
        deadline: new Date("2020-01-01"),
      });
      (Event.findOne as jest.Mock).mockResolvedValue(event);

      await expect(
        register("evt-uuid-1", "test@example.com"),
      ).rejects.toThrow(ClientError);
      await expect(
        register("evt-uuid-1", "test@example.com"),
      ).rejects.toThrow("Event is not open for registration");
    });

    it("should throw ClientError when event is at capacity", async () => {
      const event = createMockEvent({
        deadline: new Date("2030-12-01"),
        capacity: 10,
        registrationCount: 10,
      });
      (Event.findOne as jest.Mock).mockResolvedValue(event);

      await expect(
        register("evt-uuid-1", "test@example.com"),
      ).rejects.toThrow("Event is not open for registration");
    });

    it("should zero-pad registration number to 5 digits", async () => {
      const event = createMockEvent();
      (Event.findOne as jest.Mock).mockResolvedValue(event);
      (Registration.findOne as jest.Mock).mockResolvedValue(null);

      const result = await register("evt-uuid-1", "test@example.com");
      expect(result.registrationNo).toMatch(/^\d{5}$/);
    });
  });
});
