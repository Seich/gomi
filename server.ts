import { serveDir } from "@std/http";
import { Gomi } from "./gomi.ts";

const HMRer = (host: string) => `
(function() {
  if (typeof WebSocket !== 'function') {
    throw new Error('WebSocket is not supported by this browser.');
  }

  const socket = new WebSocket('ws://${host}');
  socket.addEventListener('message', () => location.reload());
})();
`;

export const serveGomita = (gomi: Gomi) => {
  return async (req: Request) => {
    if (req.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);

      socket.onclose = () => gomi.events.removeAllListeners();
      socket.onerror = (error) => console.error("WSERROR:", error);
      socket.onopen = () => {
        gomi.events.onFileCompiled((unit) => socket.send(unit.file.url));
        gomi.events.onLayoutUpdated((layout) => socket.send(layout));
      };

      return response;
    }

    if (req.url.includes("/gomi(ta)/hmr.js")) {
      const { host } = new URL(req.url);
      return new Response(HMRer(host), {
        headers: new Headers({
          "content-type": "text/javascript",
        }),
      });
    }

    const res = await serveDir(req, {
      fsRoot: Gomi.outputDir,
      showIndex: true,
      showDirListing: true,
    });

    if (res.headers.get("content-type")?.includes("text/html")) {
      const b = res.clone();
      const body = await b.text();
      const injected = body.replace(
        "</head>",
        `<!-- Gomi(ta) is hotreloading this for ya -->
  <script src="/gomi(ta)/hmr.js"></script>
</head>`,
      );
      return new Response(injected, {
        status: b.status,
        headers: b.headers,
        statusText: b.statusText,
      });
    }

    return res;
  };
};
