import React, { useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Upload, Video, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface VideoIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  helperId: string;
  helperName: string;
  videoUrl?: string;
  isUploadMode?: boolean;
  onUploadSuccess?: (url: string) => void;
}

const VideoIntroModal: React.FC<VideoIntroModalProps> = ({
  isOpen,
  onClose,
  helperId,
  helperName,
  videoUrl,
  isUploadMode = false,
  onUploadSuccess
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid video file (MP4, WebM, OGG, or MOV)');
        return;
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error('File size must be less than 100MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${helperId}_intro_${Date.now()}.${fileExt}`;
      const filePath = `helper-videos/${fileName}`;
      
      setUploadProgress(30);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, uploadedFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      setUploadProgress(80);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);
      
      // Update helper profile with video URL
      await supabase
        .from('hfh_helpers')
        .update({ video_intro_url: urlData.publicUrl })
        .eq('id', helperId);
      
      setUploadProgress(100);
      toast.success('Video uploaded successfully!');
      
      if (onUploadSuccess) {
        onUploadSuccess(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Video size={24} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
              {isUploadMode ? 'Upload Video Introduction' : `${helperName}'s Video Introduction`}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {isUploadMode ? (
            // Upload Mode
            <div>
              {!uploadedFile ? (
                <div style={{
                  border: '2px dashed #10b981',
                  borderRadius: '12px',
                  padding: '60px 24px',
                  textAlign: 'center',
                  backgroundColor: '#f0fdf4'
                }}>
                  <Upload size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                  <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                    Upload Your Video Introduction
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                    Record a 30-60 second video introducing yourself to potential clients
                  </p>
                  <label style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}>
                    Choose Video
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div style={{ marginTop: '24px' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                      Supported formats: MP4, WebM, OGG, MOV • Max size: 100MB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <Video size={24} style={{ color: '#10b981' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                          {uploadedFile.name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      {uploadProgress === 100 && (
                        <Check size={20} style={{ color: '#10b981' }} />
                      )}
                    </div>

                    {isUploading && (
                      <div>
                        <div style={{
                          height: '6px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            backgroundColor: '#10b981',
                            width: `${uploadProgress}%`,
                            transition: 'width 0.3s'
                          }} />
                        </div>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Video Preview */}
                  <div style={{
                    backgroundColor: 'black',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '24px'
                  }}>
                    <video
                      src={URL.createObjectURL(uploadedFile)}
                      controls
                      style={{ width: '100%', maxHeight: '400px' }}
                    />
                  </div>

                  {/* Upload Tips */}
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <AlertCircle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                          Video Introduction Tips:
                        </p>
                        <ul style={{ fontSize: '12px', color: '#92400e', margin: 0, paddingLeft: '16px' }}>
                          <li>Keep it between 30-60 seconds</li>
                          <li>Introduce yourself and your experience</li>
                          <li>Mention the services you offer</li>
                          <li>Smile and be friendly!</li>
                          <li>Ensure good lighting and clear audio</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setUploadedFile(null)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'white',
                        color: '#6b7280',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Choose Different Video
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      style={{
                        padding: '10px 24px',
                        backgroundColor: isUploading ? '#9ca3af' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Upload size={16} />
                      {isUploading ? 'Uploading...' : 'Upload Video'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // View Mode
            <div>
              {videoUrl ? (
                <div>
                  <div style={{
                    backgroundColor: 'black',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      style={{ width: '100%', maxHeight: '500px' }}
                    />
                  </div>
                  
                  <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      About {helperName}:
                    </p>
                    <p style={{ fontSize: '15px', color: '#111827', lineHeight: 1.6 }}>
                      Get to know your helper better through this personal video introduction. 
                      They'll share their experience, services, and what makes them great at what they do.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 24px'
                }}>
                  <Video size={64} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
                  <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                    No Video Introduction Yet
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    {helperName} hasn't uploaded a video introduction yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoIntroModal;
