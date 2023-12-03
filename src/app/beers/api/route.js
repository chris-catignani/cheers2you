
// Proxy for downloading images
export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const resp = await fetch(searchParams.get('url'))
    return new Response(resp.body)
}
