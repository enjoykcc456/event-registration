import axios from "axios";
import { ValidationError } from "../../errors";
import { resolvePostalCode } from "./onemap.service";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("onemap.service", () => {
  describe("resolvePostalCode", () => {
    beforeEach(() => {
      mockedAxios.post.mockResolvedValue({
        data: { access_token: "mock-token", expiry_timestamp: 9999999999 },
      });
    });

    it("should return address for a valid postal code", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { results: [{ ADDRESS: "123 TEST STREET" }] },
      });

      const result = await resolvePostalCode("123456");
      expect(result).toBe("123 TEST STREET");
    });

    it("should throw ValidationError when no results found", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { results: [] },
      });

      await expect(resolvePostalCode("999999")).rejects.toThrow(
        ValidationError,
      );
      await expect(resolvePostalCode("999999")).rejects.toThrow(
        "No address found for postal code: 999999",
      );
    });

    it("should throw ValidationError when results is null", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { results: null },
      });

      await expect(resolvePostalCode("000000")).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
