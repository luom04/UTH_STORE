// src/Features/Admin/pages/AdminChat.jsx
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useActiveChats, useDeleteChatAdmin } from "../../../hooks/useChat";

// Lấy origin cho socket: http://localhost:5001/api -> http://localhost:5001
const RAW_API = import.meta.env.VITE_API_BASE;
const SOCKET_URL = RAW_API.replace(/\/api\/?$/, "");

export default function AdminChat() {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedSessionRef = useRef(null);

  const { mutateAsync: deleteChatAdmin, isPending: isDeletingChat } =
    useDeleteChatAdmin();

  // 1. Lấy danh sách chat active ban đầu
  const { data: initialChats, refetch, isLoading } = useActiveChats();

  // 2. Sync dữ liệu từ API vào state local
  useEffect(() => {
    if (initialChats && Array.isArray(initialChats)) {
      console.log("[AdminChat] initialChats from API:", initialChats);
      setActiveChats(initialChats);
    }
  }, [initialChats]);

  // 3. Kết nối Socket.IO
  useEffect(() => {
    console.log("[AdminChat] connecting socket to", SOCKET_URL);

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ [Socket] Admin connected:", socket.id);
      socket.emit("admin_join_dashboard");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ [Socket] connect_error:", err.message);
    });

    socket.on("error", (errMsg) => {
      console.error("❌ [Socket] error event:", errMsg);
    });

    // Khi có tin nhắn mới từ khách/AI/admin → nhận full chatData
    socket.on("admin_receive_message", ({ sessionId, chatData }) => {
      console.log(
        "📥 [Socket] admin_receive_message:",
        sessionId,
        "messages:",
        chatData?.messages?.length
      );

      // Cập nhật danh sách hội thoại (sidebar)
      setActiveChats((prev) => {
        if (!prev || prev.length === 0) return [chatData];
        const other = prev.filter((c) => c.sessionId !== sessionId);
        return [chatData, ...other];
      });

      // ✅ Nếu admin đang mở đúng cuộc chat này → set lại FULL messages
      if (selectedSessionRef.current === sessionId) {
        const newMessages = chatData?.messages || [];
        setMessages(newMessages);
      }
    });

    // Khi admin gửi tin thành công -> chỉ log, không append để tránh double
    socket.on("admin_sent_success", ({ sessionId, content }) => {
      console.log(
        "📤 [Socket] admin_sent_success for session:",
        sessionId,
        "content:",
        content
      );

      // Tin nhắn của admin hiện tại đang được append ở sendReply (optimistic),
      // nên không cần setMessages ở đây để tránh bị duplicate.
    });

    // Khi AI mode được bật/tắt cho 1 session
    socket.on("admin_ai_mode_updated", ({ sessionId, needsHuman }) => {
      console.log(
        "🎚 [Socket] admin_ai_mode_updated:",
        sessionId,
        "needsHuman:",
        needsHuman
      );

      setActiveChats((prev) =>
        prev.map((c) => (c.sessionId === sessionId ? { ...c, needsHuman } : c))
      );
    });

    socket.on("disconnect", () => {
      console.log("🔌 [Socket] Admin disconnected");
    });

    // Cleanup
    return () => {
      console.log("[AdminChat] cleanup – disconnect socket");
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4. Auto scroll khi messages thay đổi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5. Chọn 1 hội thoại
  const selectChat = (chat) => {
    console.log("[AdminChat] selectChat:", chat.sessionId);

    setSelectedSession(chat.sessionId);
    selectedSessionRef.current = chat.sessionId;
    setMessages(chat.messages || []);
  };

  // 6. Gửi câu trả lời từ Admin
  const sendReply = () => {
    if (!reply.trim() || !selectedSessionRef.current || !socketRef.current) {
      console.warn(
        "[AdminChat] sendReply blocked: no reply or no selectedSession or no socket"
      );
      return;
    }

    const payload = {
      sessionId: selectedSessionRef.current,
      content: reply.trim(),
    };

    console.log("📤 [AdminChat] admin_send_message payload:", payload);

    // Optimistic: hiển thị luôn tin nhắn admin trên UI
    setMessages((prev) => [
      ...prev,
      {
        sender: "admin",
        content: reply.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);

    socketRef.current.emit("admin_send_message", payload);
    setReply("");
  };

  // 7. BẬT/TẮT AI CHO CUỘC CHAT HIỆN TẠI
  const currentChat = selectedSession
    ? activeChats.find((c) => c.sessionId === selectedSession)
    : null;

  const displayName =
    currentChat?.user?.customerName ||
    currentChat?.user?.name ||
    (selectedSession ? `Khách ${selectedSession.slice(-4)}` : "");

  const isAiDisabled = !!currentChat?.needsHuman; // true = AI tắt, người thật xử lý

  const toggleAiForCurrentChat = () => {
    if (!selectedSessionRef.current || !socketRef.current) {
      console.warn(
        "[AdminChat] toggleAiForCurrentChat blocked: no selectedSession or no socket"
      );
      return;
    }

    const nextValue = !isAiDisabled;

    console.log(
      "🎚 [AdminChat] toggleAiForCurrentChat:",
      selectedSessionRef.current,
      "=> needsHuman:",
      nextValue
    );

    socketRef.current.emit("admin_set_ai_mode", {
      sessionId: selectedSessionRef.current,
      needsHuman: nextValue,
    });

    // Optimistic update UI
    setActiveChats((prev) =>
      prev.map((c) =>
        c.sessionId === selectedSessionRef.current
          ? { ...c, needsHuman: nextValue }
          : c
      )
    );
  };

  // 8. XÓA / ẨN CUỘC TRÒ CHUYỆN
  const handleDeleteChat = async () => {
    if (
      !selectedSession ||
      !window.confirm("Ẩn cuộc trò chuyện này khỏi danh sách?")
    ) {
      return;
    }

    try {
      await deleteChatAdmin(selectedSession);

      setActiveChats((prev) =>
        prev.filter((c) => c.sessionId !== selectedSession)
      );
      setSelectedSession(null);
      selectedSessionRef.current = null;
      setMessages([]);
    } catch (err) {
      console.error("[AdminChat] delete chat error:", err);
    }
  };

  return (
    <div className="flex h-[85vh] bg-white rounded-lg shadow-md border overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white font-bold text-gray-700 flex justify-between items-center">
          <span>Hội thoại ({activeChats.length})</span>
          <button
            onClick={() => {
              console.log("[AdminChat] manual refetch activeChats");
              refetch();
            }}
            className="text-xs text-blue-600 hover:underline disabled:text-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeChats.length === 0 && !isLoading && (
            <div className="text-center text-gray-400 mt-10 text-sm">
              Chưa có tin nhắn nào
            </div>
          )}

          {activeChats.map((chat) => {
            const lastMsg =
              chat.messages && chat.messages.length > 0
                ? chat.messages[chat.messages.length - 1]
                : null;

            const isSelected = selectedSession === chat.sessionId;

            return (
              <div
                key={chat._id}
                onClick={() => selectChat(chat)}
                className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors ${
                  isSelected ? "bg-blue-100 border-l-4 border-l-blue-600" : ""
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-800">
                    {chat.customerName ||
                      chat.user?.name ||
                      `Khách ${chat.sessionId.slice(-4)}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {lastMsg?.timestamp
                      ? new Date(lastMsg.timestamp).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : ""}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate flex justify-between items-center gap-2">
                  <span className="truncate max-w-[80%]">
                    {lastMsg?.sender === "admin"
                      ? "Bạn: "
                      : lastMsg?.sender === "ai"
                      ? "🤖: "
                      : ""}
                    {lastMsg?.content || "Chưa có nội dung"}
                  </span>
                  {chat.needsHuman && (
                    <span
                      className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                      title="Đang được nhân viên xử lý (AI đã tạm tắt)"
                    ></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedSession ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <div className="font-bold text-gray-800">
                  Đang chat với:{" "}
                  <span className="text-blue-600">{displayName}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Trạng thái AI:{" "}
                  {isAiDisabled
                    ? "🔴 AI TẮT – Nhân viên đang xử lý"
                    : "🤖 AI BẬT – Tự động hỗ trợ khách"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAiForCurrentChat}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    isAiDisabled
                      ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                      : "bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                  }`}
                >
                  {isAiDisabled
                    ? "Bật AI trả lời"
                    : "Tắt AI, để nhân viên xử lý"}
                </button>
                <button
                  onClick={handleDeleteChat}
                  disabled={isDeletingChat}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Ẩn cuộc chat
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {messages.map((msg, idx) => {
                const isAdmin = msg.sender === "admin";
                const isAi = msg.sender === "ai";

                return (
                  <div
                    key={idx}
                    className={`flex ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg text-sm shadow-sm ${
                        isAdmin
                          ? "bg-blue-600 text-white"
                          : isAi
                          ? "bg-white border border-purple-300 text-gray-700 italic"
                          : "bg-white border border-gray-300 text-gray-800"
                      }`}
                    >
                      {isAi && (
                        <div className="text-[10px] font-bold mb-1 text-purple-500">
                          🤖 AI Trả lời
                        </div>
                      )}
                      {msg.content}
                      <div
                        className={`text-[10px] mt-1 text-right ${
                          isAdmin ? "text-blue-200" : "text-gray-400"
                        }`}
                      >
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white flex gap-3">
              <input
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Nhập câu trả lời..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendReply()}
              />
              <button
                onClick={sendReply}
                disabled={!reply.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-300 text-sm"
              >
                Gửi
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <div className="text-6xl mb-4">💬</div>
            <div>Chọn một hội thoại để bắt đầu hỗ trợ</div>
          </div>
        )}
      </div>
    </div>
  );
}
