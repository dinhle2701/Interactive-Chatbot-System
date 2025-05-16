// import React from 'react'

// const Home = () => {
//   return (
//     <div>
//       <h1>hi</h1>
//     </div>
//   )
// }

// export default Home


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadToS3 } from "../../utils/s3Upload.js"; // adjust the path as needed

export default function Home() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle | uploading | success | error
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [uploadedFileKey, setUploadedFileKey] = useState(null); // store the uploaded file key

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setUploadStatus("idle"); // reset upload status when a new file is selected
      setUploadedFileKey(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploadStatus("uploading");
      const uploadResult = await uploadToS3(file); // upload file to S3; assumes this function is defined
      setUploadedFileKey(uploadResult.Key); // store the returned file key
      setUploadStatus("success");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("error");
    }
  };

  // Send query to the backend; assumes file is uploaded before sending
  const handleSubmit = async () => {
    if (!query) return;

    const formData = new FormData();
    formData.append("query", query);
    if (uploadedFileKey) {
      formData.append("fileKey", uploadedFileKey); // send the uploaded file key if available
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/process`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: formData,
      });
      const data = await res.json();
      setResult(data.result || "");
    } catch (error) {
      console.error(error);
      setResult("Error processing request.");
    }
  };

  return (
    <div className="home">
      <div className="bg-gray-200 grid grid-rows-[1fr] items-center justify-items-center gap-16 p-6 sm:p-13">
        <div className="w-3/4">
          <div className="upload w-full bg-white px-4 py-5 mb-6">
            <div className="upload-component p-6 bg-white rounded shadow max-w-md mx-auto">
              <label
                className="block mb-2 font-semibold text-gray-700"
                htmlFor="fileInput"
              >
                Chọn file để upload:
              </label>
              <input
                id="fileInput"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="mb-4 w-full cursor-pointer"
              />

              {file && (
                <div className="mb-4">
                  <p className="text-sm text-gray-800">
                    File đã chọn: <strong>{file.name}</strong>
                  </p>
                </div>
              )}

              <button
                disabled={!file || uploadStatus === "uploading"}
                onClick={handleUpload}
                className={`px-4 py-2 rounded text-white ${
                  !file || uploadStatus === "uploading"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {uploadStatus === "uploading" ? "Uploading..." : "Upload"}
              </button>

              {uploadStatus === "success" && (
                <p className="mt-3 text-green-600">Upload thành công!</p>
              )}
              {uploadStatus === "error" && (
                <p className="mt-3 text-red-600">
                  Upload thất bại, vui lòng thử lại.
                </p>
              )}
            </div>
          </div>

          <div className="search-bar w-full bg-white px-4 py-5 mb-6">
            <p className="text-center mb-2">Please input your query</p>
            <div className="flex justify-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-amber-400 px-4 py-2 rounded"
                placeholder="Enter your question here"
              />
              <button
                onClick={handleSubmit}
                className="rounded bg-blue-400 px-4 py-2 text-white hover:bg-blue-300 hover:cursor-pointer ml-2"
              >
                Submit
              </button>
            </div>
          </div>

          <div className="content-page w-full px-5 py-12 bg-white min-h-[24rem] mt-6">
            <h2 className="text-lg font-semibold mb-4">Result:</h2>
            <div className="result whitespace-pre-wrap text-gray-800">
              {result || "No result yet."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
