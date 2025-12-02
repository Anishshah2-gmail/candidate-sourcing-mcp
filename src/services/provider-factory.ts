/**
 * Provider Factory
 *
 * Creates and manages data providers (LinkedIn or Proxycurl).
 * Allows runtime switching between providers via environment variable.
 *
 * Usage:
 *   DATA_PROVIDER=proxycurl  (default, recommended for getting started)
 *   DATA_PROVIDER=linkedin   (requires LinkedIn Talent API partnership)
 */

import {
  IDataProvider,
  ProviderType,
  ProviderStatus,
  getProviderConfigFromEnv,
} from "../types/index.js";
import { LinkedInApiService } from "./linkedin-api.js";
import { ProxycurlApiService } from "./proxycurl-api.js";

let currentProvider: IDataProvider | null = null;
let currentProviderType: ProviderType | null = null;

/**
 * Get the active data provider
 * Creates provider instance on first call or if provider type changed
 */
export function getDataProvider(): IDataProvider {
  const config = getProviderConfigFromEnv();

  // Return existing provider if type hasn't changed
  if (currentProvider && currentProviderType === config.type) {
    return currentProvider;
  }

  // Create new provider based on config
  currentProviderType = config.type;

  if (config.type === "linkedin") {
    if (!config.linkedIn?.clientId || !config.linkedIn?.clientSecret) {
      throw new Error(
        "LinkedIn provider selected but credentials not configured. " +
          "Set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and LINKEDIN_ACCESS_TOKEN " +
          "or switch to Proxycurl by setting DATA_PROVIDER=proxycurl"
      );
    }

    currentProvider = new LinkedInApiService({
      clientId: config.linkedIn.clientId,
      clientSecret: config.linkedIn.clientSecret,
      accessToken: config.linkedIn.accessToken,
      refreshToken: config.linkedIn.refreshToken,
    });
  } else {
    // Default to Proxycurl
    if (!config.proxycurl?.apiKey) {
      throw new Error(
        "Proxycurl provider selected but API key not configured. " +
          "Set PROXYCURL_API_KEY environment variable. " +
          "Get your API key from https://nubela.co/proxycurl"
      );
    }

    currentProvider = new ProxycurlApiService({
      apiKey: config.proxycurl.apiKey,
    });
  }

  return currentProvider;
}

/**
 * Get status of all configured providers
 */
export function getAllProviderStatuses(): ProviderStatus[] {
  const config = getProviderConfigFromEnv();
  const statuses: ProviderStatus[] = [];

  // Check LinkedIn
  const linkedInConfigured = !!(
    config.linkedIn?.clientId &&
    config.linkedIn?.clientSecret &&
    config.linkedIn?.accessToken
  );
  statuses.push({
    provider: "linkedin",
    configured: linkedInConfigured,
    message: linkedInConfigured
      ? "LinkedIn Talent API credentials configured"
      : "LinkedIn Talent API not configured (requires partnership)",
  });

  // Check Proxycurl
  const proxycurlConfigured = !!config.proxycurl?.apiKey;
  statuses.push({
    provider: "proxycurl",
    configured: proxycurlConfigured,
    message: proxycurlConfigured
      ? "Proxycurl API key configured"
      : "Proxycurl API key not set (get one at https://nubela.co/proxycurl)",
  });

  return statuses;
}

/**
 * Get the currently active provider type
 */
export function getActiveProviderType(): ProviderType {
  const config = getProviderConfigFromEnv();
  return config.type;
}

/**
 * Check if a specific provider is available
 */
export function isProviderAvailable(type: ProviderType): boolean {
  const config = getProviderConfigFromEnv();

  if (type === "linkedin") {
    return !!(
      config.linkedIn?.clientId &&
      config.linkedIn?.clientSecret &&
      config.linkedIn?.accessToken
    );
  }

  if (type === "proxycurl") {
    return !!config.proxycurl?.apiKey;
  }

  return false;
}

/**
 * Reset provider (useful for testing or config changes)
 */
export function resetProvider(): void {
  currentProvider = null;
  currentProviderType = null;
}
