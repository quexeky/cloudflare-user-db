import Buffer from "node:buffer";

export async function encrypt_data(data: Buffer.Buffer, binding: Fetcher) {
    const fetched_data = await binding.fetch("http://example.com/encrypt", {
        method: "POST", body: JSON.stringify({ plaintext: data.toString('hex') }), headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    });

    return fetched_data.body.getReader().read();
}


export async function decrypt_data(ciphertext: string, iv: string, binding: Fetcher) {
    const fetched_data = await binding.fetch("http://localhost:8787/encrypt", {
        method: "POST", body: JSON.stringify({ ciphertext: ciphertext, iv: iv }), headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    });

    return fetched_data.body.getReader().read();
}