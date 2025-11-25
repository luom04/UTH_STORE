// src/components/Chat/ChatWidget.jsx
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useChatHistory } from "../../hooks/useChat";
import { MessageCircle, X, Send, Minus } from "lucide-react";

const RAW_API = import.meta.env.VITE_API_BASE;
const SOCKET_URL = RAW_API.replace(/\/api\/?$/, "");

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // ✅ SỐ TIN CHƯA ĐỌC

  const messagesEndRef = useRef(null);

  // 1. Session ID
  const getSessionId = () => {
    let id = localStorage.getItem("chat_session_id");
    if (!id) {
      id = "sess_" + Date.now() + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chat_session_id", id);
    }
    return id;
  };
  const sessionId = getSessionId();
  console.log("[ChatWidget] sessionId =", sessionId);

  // 2. GỌI HOOK: Lấy lịch sử chat khi mở khung
  const { data: historyMessages, isLoading } = useChatHistory(
    sessionId,
    isOpen
  );

  // 3. Sync dữ liệu từ Hook vào State (chỉ khi lần đầu mở, messages đang rỗng)
  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      setMessages((prev) => {
        if (prev.length === 0) return historyMessages;
        return prev;
      });
    }
  }, [historyMessages]);

  // 4. KẾT NỐI SOCKET MỘT LẦN (kể cả khi widget đang đóng)
  useEffect(() => {
    console.log("[ChatWidget] connecting socket to", SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ [Socket] Customer connected:", newSocket.id);
      newSocket.emit("join_chat", sessionId);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ [Socket] connect_error:", err.message);
    });

    newSocket.on("error", (msg) => {
      console.error("❌ [Socket] error event:", msg);
    });

    // ✅ Nhận tin nhắn realtime từ server (AI / Admin)
    newSocket.on("server_send_message", (data) => {
      console.log("📥 [Socket] server_send_message:", data);

      setMessages((prev) => [...prev, data]);

      // Nếu widget đang đóng và tin không phải do chính user gửi → tăng unreadCount
      if (!isOpen && data.sender !== "user") {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      console.log("[ChatWidget] cleanup – disconnect socket");
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]); // KHÔNG phụ thuộc isOpen nữa

  // 5. Auto scroll khi messages thay đổi và widget đang mở
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // 6. Gửi tin nhắn từ Customer
  const sendMessage = () => {
    if (!input.trim() || !socket) {
      console.warn(
        "[ChatWidget] sendMessage blocked: empty input or no socket"
      );
      return;
    }

    const msgData = {
      sessionId,
      content: input.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    // Hiển thị ngay trên UI (optimistic)
    setMessages((prev) => [...prev, msgData]);

    // Gửi lên server
    socket.emit("client_send_message", {
      sessionId,
      content: input.trim(),
    });

    setInput("");
  };

  // 7. Mở widget → reset unreadCount
  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0); // ✅ đã xem tất cả
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-sans">
      {/* 🟢 NÚT BONG BÓNG CHAT (Hiện khi đóng chat) */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-all hover:scale-110 hover:bg-blue-700 active:scale-95"
        >
          <MessageCircle size={28} />

          {/* Tooltip nhỏ */}
          <span className="absolute right-full mr-3 hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
            Chat hỗ trợ
          </span>

          {/* ✅ BADGE HIỂN THỊ SỐ TIN NHẮN CHƯA ĐỌC */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* 🟢 CỬA SỔ CHAT */}
      {isOpen && (
        <div className="flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-sm">Trợ lý UTH Store</h3>
                <div className="flex items-center gap-1.5 text-[11px] opacity-90">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
                  Sẵn sàng hỗ trợ
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClose}
                className="rounded-full p-1.5 hover:bg-white/20 transition-colors"
              >
                <Minus size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 custom-scrollbar">
            {isLoading && messages.length === 0 && (
              <div className="mt-4 text-center text-xs text-gray-400">
                Đang tải tin nhắn...
              </div>
            )}

            {!isLoading && messages.length === 0 && (
              <div className="mt-8 flex flex-col items-center gap-2 text-center text-gray-400">
                <MessageCircle size={40} className="opacity-20" />
                <p className="text-sm">Xin chào! Bạn cần giúp gì không?</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {messages.map((msg, idx) => {
                const isUser = msg.sender === "user";
                const isAdmin = msg.sender === "admin";

                return (
                  <div
                    key={idx}
                    className={`flex w-full ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-[80%] flex-col ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Tên người gửi */}
                      {!isUser && (
                        <span className="mb-1 ml-1 text-[10px] font-bold text-gray-500">
                          {isAdmin ? "Hỗ trợ viên" : "AI Bot"}
                        </span>
                      )}

                      {/* Bong bóng tin nhắn */}
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isUser
                            ? "rounded-br-sm bg-blue-600 text-white"
                            : isAdmin
                            ? "rounded-bl-sm bg-orange-100 text-gray-800 border border-orange-200"
                            : "rounded-bl-sm bg-white text-gray-700 border border-gray-100"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Thời gian */}
                      <span className="mt-1 mr-1 text-[10px] text-gray-400">
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Footer Input */}
          <div className="border-t bg-white p-3">
            <div className="relative flex items-center rounded-full bg-gray-100 px-1 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
              <input
                className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none"
                placeholder="Nhập câu hỏi..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="mr-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-transform hover:scale-105 active:scale-95 disabled:bg-gray-300 disabled:scale-100"
              >
                <Send size={16} className={input.trim() ? "ml-0.5" : ""} />
              </button>
            </div>
            <div className="mt-1 text-center text-[10px] text-gray-400">
              Powered by UTH AI &copy; 2025
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
