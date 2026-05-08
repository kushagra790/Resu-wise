import React, { useState } from 'react';

const DragAndDropUpload = ({
  label = 'Upload Document',
  onFileSelect,
  selectedFile = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const validateFile = (file) => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setError('Invalid file format. Please upload PDF or DOCX files only.');
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 2MB limit.');
      return false;
    }

    setError('');
    return true;
  };

  const handleFileChange = (file) => {
    if (file && validateFile(file)) {
      onFileSelect?.(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleClick = () => {
    const input = document.getElementById(`file-input-${label}`);
    input?.click();
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleRemove = () => {
    onFileSelect?.(null);
    setError('');
    // Reset file input
    const input = document.getElementById(`file-input-${label}`);
    if (input) input.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
      </label>

      {/* Upload Area */}
      {!selectedFile ? (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`relative w-full px-6 py-12 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ease-out ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            } ${
              error ? 'border-red-400 bg-red-50' : ''
            }`}
          >
            {/* Gradient border effect overlay */}
            <div className="absolute inset-0 pointer-events-none rounded-lg" />

            {/* Content */}
            <div className="relative text-center">
              {/* Upload Icon */}
              <svg
                className={`w-10 h-10 mx-auto mb-3 transition-colors duration-300 ${
                  isDragging ? 'text-blue-500' : 'text-gray-400'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              {/* Text */}
              <p className="text-gray-700 font-medium">
                {isDragging ? 'Drop your file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-gray-500 text-sm mt-1">or click to select</p>

              {/* File types hint */}
              <p className="text-gray-400 text-xs mt-3">
                Supported: PDF, DOCX (Max 2MB)
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
        </>
      ) : (
        /* Selected File Display */
        <div className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between gap-4">
            {/* File Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* File Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                </div>
              </div>

              {/* File Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              aria-label="Remove file"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Change File Link */}
          <button
            onClick={handleClick}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            Change file
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        id={`file-input-${label}`}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
        className="hidden"
        aria-label={label}
      />
    </div>
  );
};

export default DragAndDropUpload;
