import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetChatbotReplyMutation,
  useUpdateChatbotFeedbackMutation,
} from "../../features/chatbot/chatbotApi";

const STORAGE_KEY = "dashboard_chatbot_messages_v1_6";
const SESSION_KEY = "dashboard_chatbot_session_id_v1_6";

const BOT_WELCOME = {
  id: "welcome",
  role: "bot",
  text: "Hi, I am your Product Assistant. Ask about features, settings, or posting news/events/gallery.",
};

const SUGGESTIONS = [
  "How to post news?",
  "How to change school name?",
  "How to enable/disable features?",
  "Where can I upload gallery photos?",
];

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const getSessionId = () => {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem(SESSION_KEY, created);
  return created;
};

const readStoredMessages = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [BOT_WELCOME];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [BOT_WELCOME];
  } catch (e) {
    return [BOT_WELCOME];
  }
};

const ChatbotFeature = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(readStoredMessages);

  const [getChatbotReply, { isLoading: isReplyLoading }] = useGetChatbotReplyMutation();
  const [updateFeedback] = useUpdateChatbotFeedbackMutation();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const canSend = useMemo(() => input.trim().length > 0 && !isReplyLoading, [input, isReplyLoading]);

  const setMessageFeedback = async (messageId, feedback) => {
    if (!isMongoId(messageId)) return;
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, feedback } : m)));
    try {
      await updateFeedback({ messageId, feedback }).unwrap();
    } catch (e) {
      // ignore network failure for feedback UX
    }
  };

  const sendMessage = async (rawText) => {
    const userText = rawText.trim();
    if (!userText || isReplyLoading) return;

    const timeId = Date.now();
    setMessages((prev) => [...prev, { id: `u-${timeId}`, role: "user", text: userText }]);
    setInput("");

    try {
      const res = await getChatbotReply({ question: userText, sessionId: getSessionId() }).unwrap();
      const data = res?.data;

      setMessages((prev) => [
        ...prev,
        {
          id: String(data?.messageId || `b-${timeId}`),
          role: "bot",
          text: data?.reply || "I could not generate a response. Please try again.",
          route: data?.route,
          routeLabel: data?.routeLabel,
          confidence: data?.confidence,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-err-${timeId}`,
          role: "bot",
          text: "Unable to reach chatbot service right now. Please try again.",
          confidence: "low",
        },
      ]);
    }
  };

  return (
    <div className="chatbot-wrap">
      {isOpen && (
        <div className="chatbot-card">
          <div className="chatbot-head">
            <div>
              <h6 className="mb-0">Assistant</h6>
              <small className="text-muted">Product guidance</small>
            </div>
          </div>

          <div className="chatbot-suggestions">
            {SUGGESTIONS.map((item) => (
              <button key={item} type="button" className="chatbot-chip" onClick={() => sendMessage(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={msg.id || `${msg.role}-${idx}`} className={`chatbot-msg ${msg.role === "user" ? "user" : "bot"}`}>
                <p className="mb-1">{msg.text}</p>
                {msg.role === "bot" && msg.route && (
                  <button
                    type="button"
                    className="chatbot-link-btn"
                    onClick={() => navigate(msg.route)}
                  >
                    {msg.routeLabel || "Open"}
                  </button>
                )}
                {msg.role === "bot" && isMongoId(msg.id) && (
                  <div className="chatbot-feedback-row">
                    <button
                      type="button"
                      className={`chatbot-feedback-btn ${msg.feedback === "up" ? "active" : ""}`}
                      onClick={() => setMessageFeedback(msg.id, "up")}
                      aria-label="Helpful"
                    >
                      <i className="bi bi-hand-thumbs-up"></i>
                    </button>
                    <button
                      type="button"
                      className={`chatbot-feedback-btn ${msg.feedback === "down" ? "active" : ""}`}
                      onClick={() => setMessageFeedback(msg.id, "down")}
                      aria-label="Not helpful"
                    >
                      <i className="bi bi-hand-thumbs-down"></i>
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isReplyLoading && (
              <div className="chatbot-msg bot">
                <p className="mb-0">Thinking...</p>
              </div>
            )}
          </div>

          <form
            className="chatbot-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              className="form-control"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about this panel"
            />
            <button type="submit" className="btn btn-primary" disabled={!canSend}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open assistant"
      >
        <i className={`bi ${isOpen ? "bi-x-lg" : "bi-chat-dots-fill"}`}></i>
      </button>
    </div>
  );
};

export default ChatbotFeature;
