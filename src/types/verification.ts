
export type VerificationLevel = 'basic' | 'standard' | 'premium';

export type VerificationStatus = 'pending' | 'in_review' | 'verified' | 'rejected' | 'disputed' | 'suspended';

export type DocumentType = 'business_license' | 'tax_certificate' | 'identity_document' | 'property_deed' | 'rental_agreement' | 'menu_photos' | 'interior_photos' | 'other';

export interface RestaurantVerification {
  verification_level: VerificationLevel;
  verification_status: VerificationStatus;
  verification_score: number;
  verification_requested_at?: string;
  verification_completed_at?: string;
  verification_notes?: string;
  verified_by?: string;
  last_verification_update?: string;
}

export interface VerificationRequest {
  id: string;
  restaurant_id: number;
  requester_id: string;
  requested_level: VerificationLevel;
  current_status: VerificationStatus;
  business_name: string;
  business_type?: string;
  contact_phone?: string;
  contact_email?: string;
  business_address?: string;
  additional_info?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface VerificationDocument {
  id: string;
  verification_request_id: string;
  document_type: DocumentType;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
}

export interface VerificationDispute {
  id: string;
  restaurant_id: number;
  primary_claimant_id: string;
  dispute_reason: string;
  status: string;
  evidence_summary?: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}
