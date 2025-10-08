import { Pool } from "pg";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

let cachedPool;

async function getDbCredentials() {
  const client = new SSMClient({ region: "us-east-1" });
  const command = new GetParameterCommand({
    Name: process.env.DB_PARAM_NAME,
    WithDecryption: true,
  });
  const response = await client.send(command);
  const secret = JSON.parse(response.Parameter.Value);

  return {
    host: secret.host,
    port: secret.port,
    user: secret.username,
    password: secret.password,
    database: secret.dbname,
  };
}

async function getDbPool() {
  if (cachedPool) return cachedPool;

  const creds = await getDbCredentials();
  cachedPool = new Pool({
    ...creds,
    ssl: { rejectUnauthorized: false },
  });

  return cachedPool;
}

// TODO: Add limit, offset (or some sort of pagination...)
export const handler = async (event) => {
  try {
    const pool = await getDbPool();
    const result = await pool.query(
      "SELECT id, com_name, date, time, confidence FROM detections ORDER BY Date DESC, Time DESC LIMIT 30;"
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.log("Query failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
