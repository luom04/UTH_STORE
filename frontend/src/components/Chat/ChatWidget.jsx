// src/components/Chat/ChatWidget.jsx
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useChatHistory } from "../../hooks/useChat";
import {
  MessageCircle,
  X,
  Send,
  Minus,
  Bot, // ✅ Icon Robot
} from "lucide-react";

const RAW_API = import.meta.env.VITE_API_BASE;
const SOCKET_URL = RAW_API.replace(/\/api\/?$/, "");

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(true); // ✅ State điều khiển hiển thị nhãn "Bạn cần hỗ trợ gì?"
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);

  // --- 1. LOGIC SOCKET & HISTORY (GIỮ NGUYÊN) ---
  const getSessionId = () => {
    let id = localStorage.getItem("chat_session_id");
    if (!id) {
      id = "sess_" + Date.now() + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chat_session_id", id);
    }
    return id;
  };
  const sessionId = getSessionId();

  const { data: historyMessages, isLoading } = useChatHistory(
    sessionId,
    isOpen
  );

  // Sync lịch sử chat
  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      setMessages((prev) => {
        if (prev.length === 0) return historyMessages;
        return prev;
      });
    }
  }, [historyMessages]);

  // Kết nối Socket
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_chat", sessionId);
    });

    newSocket.on("server_send_message", (data) => {
      setMessages((prev) => [...prev, data]);
      // Nếu widget đóng & tin nhắn từ server -> Tăng unread & Hiện lại nhãn
      if (!isOpen && data.sender !== "user") {
        setUnreadCount((prev) => prev + 1);
        setShowLabel(true);
      }
    });

    return () => newSocket.disconnect();
  }, [sessionId, isOpen]);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Gửi tin nhắn
  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    const msgData = {
      sessionId,
      content: input.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msgData]);
    socket.emit("client_send_message", {
      sessionId,
      content: input.trim(),
    });
    setInput("");
  };

  // Mở chat
  const handleOpen = () => {
    setIsOpen(true);
    setShowLabel(false); // Ẩn nhãn khi mở chat
    setUnreadCount(0);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* 🟢 PHẦN 1: NHÃN DÁN "Bạn cần hỗ trợ gì?" (Giống hình mẫu) */}
      {!isOpen && showLabel && (
        <div className="absolute bottom-5 right-[70px] z-50 animate-in slide-in-from-right-5 duration-500">
          <div
            className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 text-white shadow-xl shadow-red-500/20 cursor-pointer hover:scale-105 transition-transform"
            onClick={handleOpen}
          >
            {/* Avatar Robot nhỏ */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
              <Bot size={18} className="text-white" />
            </div>

            {/* Text */}
            <span className="whitespace-nowrap font-bold text-sm pr-1">
              Bạn cần hỗ trợ gì?
            </span>

            {/* Mũi tên tam giác chỉ vào nút chat */}
            <div className="absolute -right-2 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[8px] border-l-[10px] border-y-transparent border-l-rose-600"></div>

            {/* 🔴 Nút X đóng nhãn (Màu xám giống hình) */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Chặn click lan ra ngoài
                setShowLabel(false);
              }}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-white shadow-md hover:bg-gray-600 transition-colors border-2 border-white"
              title="Đóng gợi ý"
            >
              <X size={10} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* 🟢 PHẦN 2: NÚT CHAT TRÒN (Launcher Robot) */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-500 text-white shadow-lg shadow-rose-500/40 transition-all hover:scale-110 active:scale-95 ring-4 ring-white/50"
        >
          {/* Hiệu ứng sóng lan tỏa */}
          <span className="absolute inset-0 -z-10 rounded-full bg-rose-500 opacity-0 group-hover:animate-ping"></span>

          {/* Icon Robot Chính */}
          <div className="relative">
            <Bot size={34} strokeWidth={2} />
            {/* Icon hội thoại nhỏ trên đầu robot */}
            <div className="absolute -top-1 -right-2 bg-white text-rose-600 rounded-full p-[2px] shadow-sm">
              <MessageCircle size={10} fill="currentColor" />
            </div>
          </div>

          {/* Badge số tin nhắn chưa đọc */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-2 ring-white animate-bounce">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* 🟢 PHẦN 3: CỬA SỔ CHAT (Theme Đỏ/Hồng) */}
      {isOpen && (
        <div className="flex h-[550px] w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 ring-1 ring-gray-100">
          {/* Header Gradient */}
          <div className="relative flex items-center justify-between bg-gradient-to-r from-red-600 to-rose-600 p-4 text-white shadow-md">
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">
                  Trợ lý UTH
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-rose-100 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                  Thường trả lời ngay
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="relative z-10 rounded-full p-2 text-rose-100 hover:bg-white/20 hover:text-white transition-all"
            >
              <Minus size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 custom-scrollbar">
            {isLoading && messages.length === 0 && (
              <div className="mt-10 text-center text-xs text-gray-400">
                Đang tải tin nhắn...
              </div>
            )}

            {!isLoading && messages.length === 0 && (
              <div className="mt-10 flex flex-col items-center gap-2 text-center text-gray-400 opacity-60">
                <Bot size={48} />
                <p className="text-sm">Xin chào! Tôi có thể giúp gì cho bạn?</p>
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
                    {!isUser && (
                      <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 border border-rose-200">
                        {isAdmin ? "Ad" : <Bot size={16} />}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      {!isUser && (
                        <span className="mb-1 ml-1 text-[10px] text-gray-400 font-medium">
                          {isAdmin ? "Admin" : "AI Support"}
                        </span>
                      )}
                      <div
                        className={`px-4 py-2.5 text-sm shadow-sm ${
                          isUser
                            ? "rounded-2xl rounded-tr-none bg-gradient-to-br from-red-500 to-rose-600 text-white"
                            : "rounded-2xl rounded-tl-none bg-white border border-gray-100 text-gray-800"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span
                        className={`mt-1 text-[10px] text-gray-400 block ${
                          isUser ? "text-right pr-1" : "pl-1"
                        }`}
                      >
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString(
                              "vi-VN",
                              { hour: "2-digit", minute: "2-digit" }
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
            <div className="relative flex items-center rounded-full bg-gray-100 px-1 border border-transparent focus-within:border-rose-400 focus-within:bg-white transition-all">
              <input
                className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-gray-400"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="mr-1 flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition-all hover:bg-rose-700 hover:scale-105 active:scale-95 disabled:bg-gray-300 disabled:scale-100"
              >
                <Send size={16} className={input.trim() ? "ml-0.5" : ""} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
