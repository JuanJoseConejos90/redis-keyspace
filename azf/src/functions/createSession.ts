import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { v4 as uuidv4 } from "uuid";
import { createJsonData } from "../Models/Utils";
import { redis, initRedis } from "../Models/redisClient";

export async function createSession(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {

    await initRedis(); // safe singleton init

    const name = request.headers.get("name");
    const lastName = request.headers.get("lastName");
    const secondLastName = request.headers.get("secondLastName");
    const channelCJ = request.headers.get("channel");

    const sessionId = uuidv4();

    const TTL = Number(process.env.APP_REDIS_DELAY) || 300;
    const PRE_OFFSET = 60; // 1 minute before

    const body = createJsonData(sessionId, channelCJ, name, lastName, secondLastName);

    try {
        await redis.multi().set(`${sessionId}`, JSON.stringify(body), "EX", TTL).set(`reminder:${sessionId}`, "1", "EX", TTL - PRE_OFFSET).exec();

        return {
            status: 200,
            jsonBody: {
                code: 0,
                msg: "Success",
                sessionId
            }
        };

    } catch (error) {
        context.error(error);

        return {
            status: 500,
            jsonBody: {
                code: 4,
                msg: error.toString()
            }
        };
    }
}

app.http("createSession", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: createSession
});