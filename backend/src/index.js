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

  // ✅ Thay đổi nhỏ: Gán io vào biến để setup global
  const io = attachSocket(server, config.clientUrl);

  // ✅ Thêm dòng này: Giúp bạn gọi socket ở bất kỳ đâu trong Controller (qua req.app.get('io'))
  app.set("io", io);

  server.listen(config.port, () => {
    console.log(`🚀 Server listening on http://localhost:${config.port}`);
  });
};

bootstrap();
