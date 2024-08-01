import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import {compareSync} from "bcryptjs";

export class UserAuthenticator extends OpenAPIRoute {
    schema = {
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            username: z.string().max(32),
                            password: z.string().base64().length(8), // 512 bit password hash
                        })
                    }
                }
            }
        }

    }
    async handle(c) {
        const data = await this.getValidatedData<typeof this.schema>();

        const recvPassword = data.body.password;

        console.log("RecvPassword:", recvPassword);

        const user = await c.env.DB.prepare(
            "SELECT * FROM users WHERE username = ?1",
        ).bind(data.body.username).run();

        const password = user.results[0].password;

        const result = compareSync(recvPassword, password);

        console.log(result);
        if (result) {
            return new Response(undefined, { status: 200 });
        }
        return new Response(undefined, { status: 401 });

    }
}