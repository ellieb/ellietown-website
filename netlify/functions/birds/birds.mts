import { Context } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

export default async (request: Request, context: Context) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
      );
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("detections")
      .select("id, com_name, date, time, confidence")
      .order("date", { ascending: false })
      .order("time", { ascending: false })
      .limit(20);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(error.toString(), {
      status: 500,
    });
  }
};
