import { ClientError } from "../../errors";
import { Event } from "../../models/event.model";
import { Registration } from "../../models/registration.model";
import { calculateTrend } from "./trend.service";

jest.mock("../../models/event.model");
jest.mock("../../models/registration.model");

describe("trend.service", () => {
  describe("calculateTrend", () => {
    it("should throw ClientError when event not found", async () => {
      (Event.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(calculateTrend("nonexistent")).rejects.toThrow(ClientError);
      await expect(calculateTrend("nonexistent")).rejects.toThrow(
        "Event not found",
      );
    });

    it("should return daily trend from createdAt to deadline", async () => {
      const createdAt = new Date("2024-01-01T00:00:00");
      const deadline = new Date("2024-01-03T00:00:00");
      (Event.findByPk as jest.Mock).mockResolvedValue({ createdAt, deadline });

      (Registration.findAll as jest.Mock).mockResolvedValue([
        { date: "2024-01-01", count: "3" },
        { date: "2024-01-02", count: "2" },
      ]);

      const result = await calculateTrend("evt-uuid-1");

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: "2024-01-01",
        newRegistrationCount: 3,
        registrationCount: 3,
      });
      expect(result[1]).toEqual({
        date: "2024-01-02",
        newRegistrationCount: 2,
        registrationCount: 5,
      });
      expect(result[2]).toEqual({
        date: "2024-01-03",
        newRegistrationCount: 0,
        registrationCount: 5,
      });
    });

    it("should return cumulative registration counts", async () => {
      (Event.findByPk as jest.Mock).mockResolvedValue({
        createdAt: new Date("2024-01-01T00:00:00"),
        deadline: new Date("2024-01-04T00:00:00"),
      });

      (Registration.findAll as jest.Mock).mockResolvedValue([
        { date: "2024-01-01", count: "1" },
        { date: "2024-01-03", count: "4" },
      ]);

      const result = await calculateTrend("evt-uuid-1");

      expect(result).toHaveLength(4);
      expect(result[0].registrationCount).toBe(1);
      expect(result[1].registrationCount).toBe(1);
      expect(result[2].registrationCount).toBe(5);
      expect(result[3].registrationCount).toBe(5);
    });

    it("should handle events with no registrations", async () => {
      (Event.findByPk as jest.Mock).mockResolvedValue({
        createdAt: new Date("2024-01-01T00:00:00"),
        deadline: new Date("2024-01-02T00:00:00"),
      });

      (Registration.findAll as jest.Mock).mockResolvedValue([]);

      const result = await calculateTrend("evt-uuid-1");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: "2024-01-01",
        newRegistrationCount: 0,
        registrationCount: 0,
      });
      expect(result[1]).toEqual({
        date: "2024-01-02",
        newRegistrationCount: 0,
        registrationCount: 0,
      });
    });
  });
});
