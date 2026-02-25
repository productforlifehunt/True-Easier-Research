import React, { useState } from 'react';
import { Shield, Upload, Check, AlertCircle, FileText, CreditCard, Users, Camera, CheckCircle } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  required: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

const HelperVerification: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Upload government-issued ID (Driver\'s License, Passport, or State ID)',
      icon: CreditCard,
      required: true,
      status: 'in_progress'
    },
    {
      id: 'background',
      title: 'Background Check',
      description: 'Authorize background check and criminal record screening',
      icon: Shield,
      required: true,
      status: 'pending'
    },
    {
      id: 'references',
      title: 'Professional References',
      description: 'Provide contact information for 2-3 professional references',
      icon: Users,
      required: true,
      status: 'pending'
    },
    {
      id: 'photo',
      title: 'Profile Photo',
      description: 'Upload a clear, professional profile photo',
      icon: Camera,
      required: true,
      status: 'pending'
    },
    {
      id: 'certifications',
      title: 'Certifications & Licenses',
      description: 'Upload relevant certifications, licenses, or training certificates (if applicable)',
      icon: FileText,
      required: false,
      status: 'pending'
    }
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, stepId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        toast.error('Please sign in to upload documents');
        return;
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${stepId}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (error) throw error;

      // Update verification status
      await supabase
        .from('hfh_verifications')
        .upsert({
          helper_id: user.id,
          verification_type: stepId,
          document_url: data.path,
          status: 'pending_review',
          submitted_at: new Date().toISOString()
        });

      // Update step status
      setVerificationSteps(prev =>
        prev.map(step =>
          step.id === stepId ? { ...step, status: 'completed' as const } : step
        )
      );

      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const completeStep = (stepId: string) => {
    setVerificationSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, status: 'completed' as const } : step
      )
    );
    
    const currentIndex = verificationSteps.findIndex(s => s.id === stepId);
    if (currentIndex < verificationSteps.length - 1) {
      setCurrentStep(currentIndex + 1);
      setVerificationSteps(prev =>
        prev.map((step, idx) =>
          idx === currentIndex + 1 ? { ...step, status: 'in_progress' as const } : step
        )
      );
    }
  };

  const completedSteps = verificationSteps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / verificationSteps.length) * 100;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #f3f4f6',
        background: '#10b981'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Shield size={28} style={{ color: 'white' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: 0 }}>
            Helper Verification
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', margin: 0, marginBottom: '20px' }}>
          Complete verification to build trust with clients and unlock full platform features
        </p>

        {/* Progress Bar */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>
              {completedSteps} of {verificationSteps.length} steps completed
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'white',
              transition: 'width 0.3s ease',
              borderRadius: '4px'
            }} />
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      <div style={{ padding: '24px' }}>
        {verificationSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === index;
          const isCompleted = step.status === 'completed';
          const isRejected = step.status === 'rejected';

          return (
            <div
              key={step.id}
              style={{
                marginBottom: index < verificationSteps.length - 1 ? '24px' : 0,
                padding: '24px',
                backgroundColor: isActive ? '#f0fdf4' : 'white',
                border: `2px solid ${isCompleted ? '#10b981' : isActive ? '#10b981' : isRejected ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '12px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', gap: '16px' }}>
                {/* Step Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: isCompleted ? '#10b981' : isRejected ? '#ef4444' : isActive ? '#10b981' : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isCompleted ? (
                    <CheckCircle size={24} style={{ color: 'white' }} />
                  ) : isRejected ? (
                    <AlertCircle size={24} style={{ color: 'white' }} />
                  ) : (
                    <Icon size={24} style={{ color: isActive ? 'white' : '#9ca3af' }} />
                  )}
                </div>

                {/* Step Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#111827',
                      margin: 0
                    }}>
                      {step.title}
                    </h3>
                    {step.required && !isCompleted && (
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        REQUIRED
                      </span>
                    )}
                    {isCompleted && (
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Check size={12} />
                        VERIFIED
                      </span>
                    )}
                  </div>

                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '16px',
                    lineHeight: 1.5
                  }}>
                    {step.description}
                  </p>

                  {/* Action Buttons */}
                  {!isCompleted && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {(step.id === 'identity' || step.id === 'photo' || step.id === 'certifications') && (
                        <label style={{
                          padding: '10px 20px',
                          backgroundColor: isActive ? '#10b981' : '#f3f4f6',
                          color: isActive ? 'white' : '#6b7280',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: uploading ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}>
                          <Upload size={16} />
                          {uploading ? 'Uploading...' : 'Upload Document'}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload(e, step.id)}
                            disabled={uploading}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}

                      {step.id === 'background' && (
                        <button
                          onClick={() => completeStep(step.id)}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: isActive ? '#10b981' : '#f3f4f6',
                            color: isActive ? 'white' : '#6b7280',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Shield size={16} />
                          Authorize Background Check
                        </button>
                      )}

                      {step.id === 'references' && (
                        <button
                          onClick={() => completeStep(step.id)}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: isActive ? '#10b981' : '#f3f4f6',
                            color: isActive ? 'white' : '#6b7280',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Users size={16} />
                          Add References
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {progress === 100 && (
        <div style={{
          padding: '24px',
          borderTop: '1px solid #f3f4f6',
          backgroundColor: '#f0fdf4',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckCircle size={28} style={{ color: 'white' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              Verification Complete!
            </h4>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Your application is under review. We'll notify you within 24-48 hours.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelperVerification;
