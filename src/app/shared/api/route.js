import { kv } from "@vercel/kv";

export const dynamic = 'force-dynamic' // defaults to force-static

export async function POST(request) {
    const requestJson = await request.json()

    await kv.set(requestJson.fileId, requestJson, { ex: 6 * 60 * 60 });
   
    return Response.json(requestJson)
}
