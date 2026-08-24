// server.js — 100% cPanel Phusion Passenger & CloudLinux Compatible Next.js Server
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// In cPanel Phusion Passenger, process.env.PORT may be a Unix socket path or a port number.
// Do NOT parseInt(process.env.PORT) as socket paths will become NaN.
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> [ENMAR] Server ready on ${port}`);
  });
});
