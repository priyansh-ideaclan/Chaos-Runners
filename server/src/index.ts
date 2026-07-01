import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'colyseus';

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', milestone: 1 });
});

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

server.listen(port, () => {
  console.log(`[Fall Guys Server] Listening on http://localhost:${port}`);
});
