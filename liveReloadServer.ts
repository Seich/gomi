import type { Gomi } from "./gomi.ts";
import embed from "./hmr.json" with { type: "json" };

const LiveReloadScript = new TextDecoder().decode(
  new Uint8Array(embed["hmr.js"].contents),
);

export const LIVERELOAD_PORT = 35729;

type LRMessage = {
  command: "hello";
  protocols: Array<string>;
  ver: string;
} | {
  command: "info";
  plugins: Record<string, { disable: boolean; version: string }>;
  url: string;
};

export const liveReload = (gomi: Gomi) => {
  let currentUrl: string | null = null;
  return (req: Request) => {
    if (req.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);

      socket.onclose = () => gomi.events.removeAllListeners();
      socket.onerror = (error) => console.error("WSERROR:", error);
      socket.onopen = () => {
        gomi.events.onFileCompiled((unit) => {
          socket.send(JSON.stringify({
            command: "reload",
            path: unit.file.url,
            liveCSS: true,
            liveImg: true,
          }));
        });

        gomi.events.onLayoutUpdated(() =>
          socket.send(JSON.stringify({
            command: "reload",
            path: currentUrl,
            liveCSS: true,
            liveImg: true,
          }))
        );
      };

      socket.onmessage = (ev) => {
        const message: LRMessage = JSON.parse(ev.data);
        if (message.command === "hello") {
          socket.send(JSON.stringify({
            command: "hello",
            protocols: [
              "http://livereload.com/protocols/official-7",
            ],
            serverName: "Gomi(ta)",
          }));
        } else if (message.command === "info") {
          currentUrl = message.url;
        }
      };

      return response;
    }

    if (req.url.includes("livereload.js")) {
      return new Response(LiveReloadScript, {
        headers: new Headers({
          "content-type": "text/javascript",
        }),
      });
    }

    return new Response();
  };
};

export const injectLiveReloadScript = async (req: Request, res: Response) => {
  const livereload = new URL(req.url);
  livereload.port = `${LIVERELOAD_PORT}`;
  livereload.pathname = "/livereload.js";

  const response = res.clone();
  const body = await response.text();
  const injected = body.replace(
    "</head>",
    `<!-- Gomi(ta) is hotreloading this for ya -->
  <script src="${livereload.href}"></script>
</head>`,
  );
  return new Response(injected, {
    status: response.status,
    headers: response.headers,
    statusText: response.statusText,
  });
};
