import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadToS3 } from "../../utils/s3Upload.js";

export default function Home() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadedFileKey, setUploadedFileKey] = useState(null);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    localStorage.clear()
    window.location.reload()
  }

  const startNewConversation = () => {
    if (messages.length > 0) {
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: messages[0]?.content?.slice(0, 30) || "Hội thoại không tên",
          messages,
        },
      ]);
    }

    setMessages([]);
    setCurrentInput("");
    setFile(null);
    setUploadedFileKey(null);
    setUploadStatus("idle");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploadStatus("uploading");
    try {
      const uploadResult = await uploadToS3(file);
      setUploadedFileKey(uploadResult.Key);
      setUploadStatus("success");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
    }
  };

  const handleSubmit = async () => {
    if (!currentInput) return;

    const userMsg = { type: "user", content: currentInput };
    setMessages((prev) => [...prev, userMsg]);
    setCurrentInput("");

    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("query", currentInput);
      if (uploadedFileKey) {
        formData.append("fileKey", uploadedFileKey);
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/process`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: formData,
      });

      const data = await res.json();
      const botMsg = { type: "bot", content: data.result || "No result returned." };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Request error:", error);
      setMessages((prev) => [...prev, { type: "bot", content: "Lỗi xử lý yêu cầu." }]);
    }
  };

  const loadHistory = (entry) => {
    setMessages(entry.messages);
    setCurrentInput("");
    setUploadedFileKey(null);
    setFile(null);
    setUploadStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left: Chat area */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded shadow p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Chatbot</h2>
            <button
              onClick={startNewConversation}
              className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded"
            >
              Tạo hộp thoại mới
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 border rounded p-4 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400">Chưa có hội thoại nào</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg shadow text-white ${msg.type === "user" ? "bg-blue-500" : "bg-gray-600"
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Upload */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Tải tài liệu (PDF):</label>
            <div className="flex gap-2 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              <button
                disabled={!file || uploadStatus === "uploading"}
                onClick={handleUpload}
                className={`px-3 py-2 rounded text-white ${uploadStatus === "uploading"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-400"
                  }`}
              >
                {uploadStatus === "uploading" ? "Đang tải..." : "Upload"}
              </button>
            </div>
            {file && <p className="text-sm text-gray-700 mt-1">Đã chọn: {file.name}</p>}
            {uploadStatus === "success" && (
              <p className="text-green-600 mt-1 text-sm">Upload thành công!</p>
            )}
            {uploadStatus === "error" && (
              <p className="text-red-600 mt-1 text-sm">Upload thất bại!</p>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="flex-1 border border-gray-300 rounded px-3 py-2"
            />
            <button
              onClick={handleSubmit}
              disabled={!currentInput}
              className={`px-4 py-2 rounded text-white ${!currentInput
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-400"
                }`}
            >
              Gửi
            </button>
          </div>
        </div>
      </div>

      {/* Right: Sidebar lịch sử */}
      <div className="w-1/5 p-4 bg-white shadow border-l relative">
        <h3 className="text-lg font-semibold mb-4">Lịch sử hội thoại</h3>
        <div className="space-y-2 max-h-[90vh] overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có lịch sử.</p>
          ) : (
            history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => loadHistory(entry)}
                className="block w-full text-left p-2 rounded hover:bg-gray-100 border"
              >
                {entry.title}
              </button>
            ))
          )}
        </div>
        <button onClick={handleLogout} className="absolute bottom-1 left-0  w-full bg-black text-white px-4 py-3">Đăng xuất</button>
      </div>
    </div>
  );
}