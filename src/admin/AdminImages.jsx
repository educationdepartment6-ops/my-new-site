import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Check, Copy, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminImages() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Invalid format. Only PNG, JPG, and WebP are supported.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File size exceeds 2MB limit.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadedUrl(data.imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = () => {
    if (!uploadedUrl) return;
    navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-emerald-400" />
          <span>Product Image Studio</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Upload and validate transparent compound vial images. Previews rendered in exact 4:3 product card aspect ratio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-zinc-950/70 border border-zinc-800 space-y-4">
            <h2 className="text-sm font-semibold font-mono text-zinc-200">Upload Image Asset</h2>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl p-8 text-center transition-colors">
              <input
                type="file"
                id="file-upload"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2 text-zinc-400 hover:text-zinc-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-emerald-400">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-zinc-200 mt-2">
                  Click to select vial image
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  PNG / JPG / WebP • Max 2MB
                </span>
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                <span className="text-zinc-300 font-mono truncate max-w-xs">{selectedFile.name}</span>
                <span className="text-zinc-500 font-mono text-[11px]">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing & Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Store</span>
                </>
              )}
            </button>

            {uploadedUrl && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                  <Check className="w-4 h-4" />
                  <span>File Successfully Saved!</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={uploadedUrl}
                    className="flex-1 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300"
                  />
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4:3 Live Card Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <h2 className="text-sm font-semibold font-mono text-zinc-200">
              4:3 Card Frame Validation Preview
            </h2>
            <p className="text-xs text-zinc-500">
              Matches public store product card dimensions and 85% height scaling.
            </p>

            <div className="aspect-[4/3] rounded-2xl bg-[#0B0B0C] border border-zinc-800 flex items-center justify-center p-4 relative overflow-hidden">
              {previewUrl || uploadedUrl ? (
                <img
                  src={uploadedUrl || previewUrl}
                  alt="Vial Preview"
                  className="max-h-[85%] w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                />
              ) : (
                <div className="text-center text-zinc-600 text-xs font-mono">
                  Select an image to preview card frame fit
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
