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

        if (data.query.auth_key !== "tKXcegBk0FqlqvCiB5Gz-Ml5Y2k6Kddh-6X4FjZq5xCqcKzBJnkx7snVOF62JtnB") {
            return new Response(undefined, {status: 401});
        }

        const recvPassword = data.query.password;
        const email = () =>

        const password = hashSync(recvPassword);
        console.log("Password:", password);

        console.log("User:", data.query.username);

        const result = await c.env.DB.prepare(
            "INSERT INTO users(username, password, email) VALUES(?1, ?2, ?3)"
        ).bind(data.query.username, password, email).run();

        console.log(result);

        return result;
    }
}

function email_parse(email: string) {
    if (!email) {
        return null;
    }
    return email;

}