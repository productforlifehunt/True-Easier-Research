import React, { useState, useRef } from 'react';
import { Video, Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react';

interface VideoProfileProps {
  videoUrl?: string;
  posterImage?: string;
  helperName: string;
  onClose?: () => void;
}

const VideoProfile: React.FC<VideoProfileProps> = ({
  videoUrl,
  posterImage,
  helperName,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      backgroundColor: '#000',
      borderRadius: '12px',
      overflow: 'hidden',
      aspectRatio: '16/9'
    }}
    onMouseEnter={() => setShowControls(true)}
    onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          poster={posterImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: '#1f2937',
          backgroundImage: posterImage ? `url(${posterImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(16, 185, 129, 0.9)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
          onClick={togglePlay}>
            <Video size={36} color="white" />
          </div>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '8px 16px',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{
              fontSize: '14px',
              color: 'white',
              fontWeight: 500
            }}>
              Video Introduction
            </span>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {showControls && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s'
        }}>
          {/* Top Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start'
          }}>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              padding: '8px 12px',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{
                fontSize: '14px',
                color: 'white',
                fontWeight: 600
              }}>
                {helperName}'s Introduction
              </span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <X size={20} color="white" />
              </button>
            )}
          </div>

          {/* Center Play Button */}
          {!isPlaying && videoUrl && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <button
                onClick={togglePlay}
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'rgba(16, 185, 129, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Play size={36} color="white" style={{ marginLeft: '4px' }} />
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={togglePlay}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              {isPlaying ? (
                <Pause size={18} color="white" />
              ) : (
                <Play size={18} color="white" style={{ marginLeft: '2px' }} />
              )}
            </button>

            <button
              onClick={toggleMute}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              {isMuted ? (
                <VolumeX size={18} color="white" />
              ) : (
                <Volume2 size={18} color="white" />
              )}
            </button>

            <div style={{ flex: 1 }} />

            <button
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Maximize size={18} color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoProfile;
