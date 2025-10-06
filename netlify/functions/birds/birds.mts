import { Context } from "@netlify/functions";
import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

export default async (request: Request, context: Context) => {
  try {
    if (!client) {
      if (!process.env.MONGODB_URI) {
        throw new Error("No DB connection details provided");
      }
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
    }
    const collection = client.db("birds").collection("detections");

    const docs = await collection
      .find(
        {},
        { projection: { com_name: 1, date: 1, time: 1, confidence: 1 } }
      )
      .sort({ date: -1, time: -1 })
      .limit(20)
      .toArray();

    return new Response(JSON.stringify(docs), {
      status: 200,
    });
  } catch (error) {
    return new Response(error.toString(), {
      status: 500,
    });
  }
};
