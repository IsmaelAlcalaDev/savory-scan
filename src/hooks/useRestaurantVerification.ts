
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VerificationRequest {
  id: string;
  restaurant_id: number;
  requester_id: string;
  requested_level: 'basic' | 'standard' | 'premium';
  current_status: 'pending' | 'in_review' | 'verified' | 'rejected' | 'disputed' | 'suspended';
  business_name: string;
  business_type?: string;
  contact_phone?: string;
  contact_email?: string;
  business_address?: string;
  additional_info?: string;
  rejection_reason?: string;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface VerificationDocument {
  id: string;
  verification_request_id: string;
  document_type: 'business_license' | 'tax_certificate' | 'identity_document' | 'property_deed' | 'rental_agreement' | 'menu_photos' | 'interior_photos' | 'other';
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  is_verified: boolean;
  created_at: string;
}

export const useRestaurantVerification = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);

  // Obtener solicitudes de verificación del usuario
  const fetchVerificationRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurant_verification_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva solicitud de verificación
  const createVerificationRequest = async (data: {
    restaurant_id: number;
    requested_level: 'basic' | 'standard' | 'premium';
    business_name: string;
    business_type?: string;
    contact_phone?: string;
    contact_email?: string;
    business_address?: string;
    additional_info?: string;
  }) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const { data: newRequest, error } = await supabase
        .from('restaurant_verification_requests')
        .insert({
          ...data,
          requester_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Actualizar la lista local
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (error) {
      console.error('Error creating verification request:', error);
      throw error;
    }
  };

  // Subir documento de verificación
  const uploadVerificationDocument = async (
    verificationRequestId: string,
    file: File,
    documentType: VerificationDocument['document_type']
  ) => {
    try {
      // Subir archivo a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${verificationRequestId}_${documentType}_${Date.now()}.${fileExt}`;
      const filePath = `verification-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(filePath);

      // Crear registro en la base de datos
      const { data: document, error: dbError } = await supabase
        .from('verification_documents')
        .insert({
          verification_request_id: verificationRequestId,
          document_type: documentType,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return document;
    } catch (error) {
      console.error('Error uploading verification document:', error);
      throw error;
    }
  };

  // Obtener documentos de una solicitud
  const getVerificationDocuments = async (verificationRequestId: string) => {
    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('verification_request_id', verificationRequestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching verification documents:', error);
      return [];
    }
  };

  // Calcular score de verificación para un restaurante
  const calculateVerificationScore = async (restaurantId: number) => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_verification_score', {
          restaurant_id_param: restaurantId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating verification score:', error);
      return 0;
    }
  };

  useEffect(() => {
    if (user) {
      fetchVerificationRequests();
    }
  }, [user]);

  return {
    loading,
    requests,
    createVerificationRequest,
    uploadVerificationDocument,
    getVerificationDocuments,
    calculateVerificationScore,
    fetchVerificationRequests
  };
};
