import http from "http";
import { createApp } from "./app.js";
import { connectDB } from "./db.js";
import { ensureAdmin } from "./bootstrap/ensureAdmin.js";
import { config } from "./config.js";
import { attachSocket } from "./socket.js";

const bootstrap = async () => {
  await connectDB();
  await ensureAdmin(); // 👈 tạo/đảm bảo admin tồn tại

  const app = createApp();
  const server = http.createServer(app);
  attachSocket(server, config.clientUrl);

  server.listen(config.port, () => {
    console.log(`🚀 Server listening on http://localhost:${config.port}`);
  });
};

bootstrap();
