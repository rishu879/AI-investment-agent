import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import axios from "axios";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env.local");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const env = {};
  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[match[1]] = value;
  }

  return env;
}

async function runCheck(name, config) {
  const { keyValue, url, method = "get", headers = {}, data, expectedStatus = [200, 201, 202], note } = config;

  if (!keyValue && config.required !== false) {
    console.log(`[SKIP] ${name} - ${note || "missing API key"}`);
    return { name, status: "skipped", note: note || "missing API key" };
  }

  const startedAt = Date.now();
  console.log(`[RUN] ${name} - checking ${url}`);

  try {
    const response = await axios({
      method,
      url,
      headers,
      data,
      timeout: 15000,
      validateStatus: () => true,
    });

    const duration = Date.now() - startedAt;
    const ok = expectedStatus.includes(response.status);
    const label = ok ? "OK" : "FAIL";
    console.log(`[${label}] ${name} - status ${response.status} in ${duration}ms`);

    if (!ok) {
      console.log(`       body: ${String(response.data).slice(0, 180)}`);
    }

    return {
      name,
      status: ok ? "ok" : "failed",
      statusCode: response.status,
      duration,
      note,
    };
  } catch (error) {
    const duration = Date.now() - startedAt;
    console.log(`[FAIL] ${name} - request error after ${duration}ms`);
    console.log(`       ${error.message}`);
    return {
      name,
      status: "failed",
      duration,
      error: error.message,
      note,
    };
  }
}

async function main() {
  const env = parseEnvFile(envPath);

  console.log("API connectivity check starting...\n");
  console.log(`Using env file: ${envPath}`);
  console.log("\nProgress:");

  const checks = [];

  checks.push(
    await runCheck("Gemini", {
      keyValue: env.GEMINI_API_KEY,
      name: "Gemini",
      url: `https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`,
      method: "get",
      required: Boolean(env.GEMINI_API_KEY),
      note: env.GEMINI_API_KEY ? "Gemini API key present" : "Gemini API key missing",
    })
  );

  checks.push(
    await runCheck("Tavily", {
      keyValue: env.TAVILY_API_KEY,
      name: "Tavily",
      url: "https://api.tavily.com/search",
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: {
        api_key: env.TAVILY_API_KEY,
        query: "test",
        search_depth: "basic",
        max_results: 1,
      },
      required: Boolean(env.TAVILY_API_KEY),
      note: env.TAVILY_API_KEY ? "Tavily API key present" : "Tavily API key missing",
    })
  );

  checks.push(
    await runCheck("Yahoo Finance", {
      keyValue: env.YAHOO_FINANCE_BASE_URL,
      name: "Yahoo Finance",
      url: `${env.YAHOO_FINANCE_BASE_URL || "https://query1.finance.yahoo.com"}/v8/finance/chart/AAPL?interval=1d&range=1mo`,
      method: "get",
      required: false,
      note: "Yahoo Finance endpoint is public and does not require an API key",
    })
  );

  console.log("\nSummary:");
  for (const result of checks) {
    const state = result.status === "ok" ? "PASS" : result.status === "failed" ? "FAIL" : "SKIP";
    console.log(`${state} ${result.name} - ${result.note || "no details"}`);
  }
}

main().catch((error) => {
  console.error("API check failed:", error);
  process.exit(1);
});
