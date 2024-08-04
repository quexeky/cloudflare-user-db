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
                            data: z.object({
                                age: z.number().nullable(),
                                location: z.string().nullable()
                            })
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

        const recvPassword = data.body.password;
        const email = (email: string) => {
            if (!email) {
                return null;
            }
            return email;
        };

        const password = hashSync(recvPassword);
        const user_id = crypto.randomUUID();

        const result = await c.env.DB.prepare(
            "INSERT INTO users(username, password, email, user_id) VALUES(?, ?, ?, ?)"
        ).bind(data.body.username, password, email(data.body.email), user_id).run();

        if (result.success) {
            const data_res = await c.env.USER_DATA.fetch("http://localhost:8787/api/userData", {
                method: "POST", body: JSON.stringify({user_id, key: c.env.USER_DATA_AUTHORISATION_KEY, data: data.body.data}), headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });
            console.log(data_res);
            if (data_res.ok) {
                return new Response(undefined, {status: 200});
            }

            return new Response(undefined, {status: 500});
        }
        return new Response(undefined, {status: 400});
    }
}
