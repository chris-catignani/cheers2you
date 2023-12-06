
const SIX_HOURS_AS_SECONDS = 6 * 60 * 60

// Proxy for downloading images
export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const resp = await fetch(searchParams.get('url'))
    return new Response(resp.body, { headers: {'Cache-Control': `max-age=${SIX_HOURS_AS_SECONDS}`}})
}
