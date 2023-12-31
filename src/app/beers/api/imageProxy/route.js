
const ONE_DAY_AS_SECONDS = 24 * 60 * 60

// Proxy for downloading images
export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const resp = await fetch(searchParams.get('url'))
    return new Response(resp.body, { headers: {'Cache-Control': `max-age=${ONE_DAY_AS_SECONDS}`}})
}
