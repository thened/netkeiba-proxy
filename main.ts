const ALLOWED_PREFIXES = [
  "https://nar.netkeiba.com/",
  "https://www.netkeiba.com/",
  "https://race.netkeiba.com/",
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/health") {
    return new Response("ok");
  }

  if (url.pathname !== "/proxy/html") {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const target = url.searchParams.get("url") ?? "";
  if (!ALLOWED_PREFIXES.some((p) => target.startsWith(p))) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch(target, {
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ja,en-US;q=0.9",
    },
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: `upstream HTTP ${res.status}` }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await res.arrayBuffer();
  return new Response(body, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
