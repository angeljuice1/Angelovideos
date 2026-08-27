  async fetch(request, env) {

    const url = new URL(request.url);

    // Upload photos, videos, and files
    if (request.method === "POST" && url.pathname === "/upload") {

      const filename = decodeURIComponent(
        request.headers.get("X-Filename") || "untitled"
      );

      const contentType =
        request.headers.get("Content-Type") ||
        "application/octet-stream";

      await env.VIDEOS.put(filename, request.body, {
        httpMetadata: {
          contentType: contentType
        }
      });

      return new Response(
        JSON.stringify({
