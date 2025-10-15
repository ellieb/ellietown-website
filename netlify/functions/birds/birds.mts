import { Context } from "@netlify/functions";

// TODO: cache results, speed everything uP!
export default async (request: Request, context: Context) => {
  try {
    const response = await fetch(process.env.LAMBDA_URI + "/recent-birds", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
    });

    const body = await response.json();

    if (response.status !== 200) {
      throw new Error(body.error.message);
    }

    return new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(error.toString(), {
      status: 500,
    });
  }
};
