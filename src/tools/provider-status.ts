/**
 * MCP Tool: get_provider_status
 * Check the status and configuration of data providers
 */

import { z } from "zod";
import {
  getDataProvider,
  getAllProviderStatuses,
  getActiveProviderType,
} from "../services/provider-factory.js";

export const getProviderStatusSchema = z.object({});

export async function getProviderStatus() {
  const activeProvider = getActiveProviderType();
  const allStatuses = getAllProviderStatuses();

  let creditBalance: number | undefined;

  // Try to get credit balance for Proxycurl
  if (activeProvider === "proxycurl") {
    try {
      const { ProxycurlApiService } = await import("../services/proxycurl-api.js");
      const provider = getDataProvider();
      if (provider.providerName === "proxycurl") {
        creditBalance = await (provider as InstanceType<typeof ProxycurlApiService>).getCreditBalance();
      }
    } catch {
      // Credit balance check failed, continue without it
    }
  }

  return {
    active_provider: activeProvider,
    credit_balance: creditBalance,
    providers: allStatuses.map((s) => ({
      name: s.provider,
      configured: s.configured,
      is_active: s.provider === activeProvider,
      message: s.message,
    })),
    usage_notes: {
      proxycurl: {
        cost_per_search_result: "3 credits",
        cost_per_profile_detail: "1 credit",
        cost_per_role_lookup: "3 credits",
        signup_url: "https://nubela.co/proxycurl",
      },
      linkedin: {
        requirement: "LinkedIn Talent Solutions API partnership",
        note: "Requires enterprise agreement with LinkedIn",
      },
    },
    switch_provider_instruction:
      "Set DATA_PROVIDER environment variable to 'linkedin' or 'proxycurl' in Claude Desktop config",
  };
}

export const getProviderStatusTool = {
  name: "get_provider_status",
  description: `Check the status and configuration of data providers.

Shows:
- Which provider is currently active (LinkedIn or Proxycurl)
- Configuration status of all providers
- Credit balance (for Proxycurl)
- Cost information per API call

Use this to verify your setup or troubleshoot connection issues.`,
  inputSchema: getProviderStatusSchema,
  handler: getProviderStatus,
};
