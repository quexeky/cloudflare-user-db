import {OpenAPIRoute} from "chanfana";
import {z} from "zod";
import {hashSync} from "bcryptjs";

export class GetUserID extends OpenAPIRoute {
    schema = {
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            username: z.string().max(32),
                            auth_key: z.string().base64().length(86),
                        }),
                    }
                }
            }
        },
    }

    async handle(c) {
        const data = await this.getValidatedData<typeof this.schema>();
        if (data.body.auth_key !== c.env.USER_ID_AUTH_KEY) {
            return new Response(undefined, {status: 401});
        }

        const result = await c.env.DB.prepare(
            "SELECT * FROM users WHERE username = ?",
        ).bind(data.body.username).run();
        console.log(result);

        if (result.results.length === 0) {
            return new Response(undefined, {status: 404});
        }

        return new Response(result.results[0].user_id, {status: 200});

    }
}
