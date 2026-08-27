export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Upload a photo, video, or file to R2
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
          success: true,
          filename: filename
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Display a file stored in R2
    if (
      request.method === "GET" &&
      url.pathname.startsWith("/media/")
    ) {
      const filename = decodeURIComponent(
        url.pathname.substring("/media/".length)
      );

      const object = await env.VIDEOS.get(filename);

      if (!object) {
        return new Response("File not found", {
          status: 404
        });
      }

      const headers = new Headers();

      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);

      return new Response(object.body, {
        headers: headers
      });
    }

    // Everything else comes from the website
    return env.ASSETS.fetch(request);
  }
};
