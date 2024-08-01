import {OpenAPIRoute} from "chanfana";
import {z} from "zod";
import {hashSync} from "bcryptjs";

export class UserCreation extends OpenAPIRoute {
    schema = {
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            username: z.string().max(32),
                            password: z.string().base64().length(8), // 512 bit password hash
                            email: z.string().max(256).optional(),
                            auth_key: z.string().length(64),
                        }),
                    }
                }
            }
        },
    }

    async handle(c) {
        const data = await this.getValidatedData<typeof this.schema>();
        if (data.body.auth_key !== c.env.AUTH_KEY) {
            return new Response(undefined, {status: 401});
        }

        const existing = await c.env.DB.prepare(
            "SELECT * FROM users WHERE username = ?1",
        ).bind(data.body.username).run();
        if (existing.results.length > 0) {
            return new Response(undefined, {status: 409});
        }
        console.log(c.env.AUTH_KEY);

        const recvPassword = data.body.password;
        const email = (email: string) => {
            if (!email) {
                return null;
            }
            return email;
        };

        const password = hashSync(recvPassword);
        console.log("Password:", password);



        const result = await c.env.DB.prepare(
            "INSERT INTO users(username, password, email) VALUES(?, ?, ?)"
        ).bind(data.body.username, password, email(data.body.email)).run();

        console.log(result);

        if (result.success) {
            return new Response(undefined, {status: 201});
        }
        return new Response(undefined, {status: 400});
    }
}
