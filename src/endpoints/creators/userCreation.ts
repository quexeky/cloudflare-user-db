import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { hashSync } from "bcryptjs";

export class UserCreation extends OpenAPIRoute {
    schema = {
        request: {
            query: z.object({
                username: z.string().max(32),
                password: z.string().base64().length(8), // 512 bit password hash
                email: z.string().max(256).optional(),
                auth_key: z.string().length(64),

            })
        }
    }
    async handle(c) {
        const data = await this.getValidatedData<typeof this.schema>();
        if (data.query.auth_key !== c.env.AUTH_KEY) {
            return new Response(undefined, { status: 401 });
        }

        const req =  new Request("https://example.com/encrypt", { method: "POST" , body: JSON.stringify({ plaintext: data }) });
        const fetch_data = await c.env.ENCDEC.fetch(req);

        const existing = await c.env.DB.prepare(
            "SELECT * FROM users WHERE username = ?1",
        ).bind(data.query.username).run();
        if (existing.results.length > 0) {
            return new Response(undefined, { status: 409 });
        }
        console.log(c.env.AUTH_KEY);


        const recvPassword = data.query.password;
        const email = (email: string) => {
                if (!email) {
                return null;
            }
            return email;
        };

        const password = hashSync(recvPassword);
        console.log("Password:", password);

        console.log("User:", data.query.username);

        const result = await c.env.DB.prepare(
            "INSERT INTO users(username, password, email) VALUES(?, ?, ?)"
        ).bind(data.query.username, password, email(data.query.email)).run();

        console.log(result);

        if (result.success) {
            return new Response(undefined, { status: 201 });
        }
        return new Response(fetch_data, { status: 400  });
    }
}
