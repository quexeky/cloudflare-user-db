import {OpenAPIRoute} from "chanfana";
import {z} from "zod";
import {compareSync} from "bcryptjs";

export class UserAuthenticator extends OpenAPIRoute {
    schema = {
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            username: z.string().max(32),
                            password: z.string().base64().length(86), // 512 bit password hash in base64
                        })
                    }
                }
            }
        }
    }

    async handle(c) {
        const data = await this.getValidatedData<typeof this.schema>();

        const recvPassword = data.body.password;

        const user = await c.env.DB.prepare(
            "SELECT * FROM users WHERE username = ?",
        ).bind(data.body.username).run();

        if (user.results.length != 1) {
            return new Response("User could not be found", {status: 401});
        }

        const password = user.results[0].password;

        const result = compareSync(recvPassword, password);

        if (result) {
            return new Response(undefined, {status: 200})
        }
        return new Response(undefined, {status: 401});

    }
}