import axios from "axios";
import { ONEMAP_SEARCH_URL, ONEMAP_TOKEN_URL } from "../../constants/common.constants";
import { ValidationError } from "../../errors";

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Retrieves a cached OneMap API access token, refreshing if expired.
 *
 * @returns {Promise<string>} The valid access token.
 */
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < tokenExpiresAt - 60) {
    return cachedToken;
  }

  const response = await axios.post<{
    access_token: string;
    expiry_timestamp: number;
  }>(ONEMAP_TOKEN_URL, {
    email: process.env.ONEMAP_EMAIL,
    password: process.env.ONEMAP_PASSWORD,
  });

  cachedToken = response.data.access_token;
  tokenExpiresAt = response.data.expiry_timestamp;
  return cachedToken;
}

/**
 * Resolves a 6-digit Singapore postal code to a full address via OneMap API.
 *
 * @param {string} postalCode - The 6-digit Singapore postal code.
 * @returns {Promise<string>} The resolved street address.
 * @throws {ValidationError} If no address is found for the postal code.
 */
export async function resolvePostalCode(postalCode: string): Promise<string> {
  const token = await getAccessToken();

  const response = await axios.get<{
    results: Array<{ ADDRESS: string }>;
  }>(ONEMAP_SEARCH_URL, {
    params: {
      searchVal: postalCode,
      returnGeom: "N",
      getAddrDetails: "Y",
    },
    headers: { Authorization: token },
  });

  const results = response.data.results;
  if (!results || results.length === 0) {
    throw new ValidationError(
      `No address found for postal code: ${postalCode}`,
    );
  }

  return results[0].ADDRESS;
}
