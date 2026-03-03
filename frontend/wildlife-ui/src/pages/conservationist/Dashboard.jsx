import { useRef } from "react";
import axios from "axios";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function ConservationistDashboard() {
    const fileRef = useRef();

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            await axios.post("http://localhost:8000/api/images/upload/", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Image uploaded successfully!");
        } catch {
            alert("Upload failed. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-[#d4e8d0] tracking-tight">Dashboard</h1>
                <p className="text-sm text-[#4a7a5a] mt-0.5">Upload camera trap images for AI analysis</p>
            </div>

            {/* Upload card */}
            <div
                onClick={() => fileRef.current.click()}
                className="bg-[#0f1f17] border-2 border-dashed border-[#2d6a4f] rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#52b788] hover:bg-[#0d1a12] transition-all duration-200 group"
            >
                <div className="w-14 h-14 rounded-xl bg-[#1a3a20] border border-[#2d6a4f] flex items-center justify-center mb-4 group-hover:bg-[#2d6a4f] transition-colors">
                    <CloudUploadIcon className="text-[#52b788]" />
                </div>
                <p className="text-sm font-medium text-[#b7d9c2] mb-1">Click to upload an image</p>
                <p className="text-xs text-[#4a7a5a]">JPG, PNG supported</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>

            {/* Placeholder stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Images Uploaded", value: 0 },
                    { label: "Predictions Made", value: 0 },
                    { label: "Species Detected", value: 0 },
                ].map((s) => (
                    <div key={s.label} className="bg-[#0f1f17] border border-[#1e3328] rounded-xl p-5">
                        <p className="text-xs text-[#4a7a5a] uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-3xl font-bold text-[#d4e8d0]">{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}