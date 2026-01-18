'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface LeadFormData {
  name: string;
  email: string;
  company?: string;
  industry?: string;
  goal: string;
}

export interface SubmitLeadResult {
  success: boolean;
  error?: string;
}

export async function submitLead(data: LeadFormData): Promise<SubmitLeadResult> {
  // Validate required fields
  if (!data.name || !data.name.trim()) {
    return { success: false, error: 'Name is required' };
  }

  if (!data.email || !data.email.trim()) {
    return { success: false, error: 'Email is required' };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  if (!data.goal || !data.goal.trim()) {
    return { success: false, error: 'Please describe your challenge or goal' };
  }

  try {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.from('chatman_leads').insert({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      company: data.company?.trim() || null,
      industry: data.industry?.trim() || null,
      goal: data.goal.trim(),
      source: 'website_modal',
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: 'Failed to submit. Please try again.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Submit lead error:', err);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
