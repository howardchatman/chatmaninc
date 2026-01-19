'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface LeadFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  goal: string;
  urgency?: string;
  currentTools?: string;
  wantsDemo?: boolean;
}

export interface SubmitLeadResult {
  success: boolean;
  error?: string;
}

export async function submitLead(data: LeadFormData): Promise<SubmitLeadResult> {
  if (!data.name || !data.name.trim()) {
    return { success: false, error: 'Name is required' };
  }

  if (!data.email || !data.email.trim()) {
    return { success: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  if (!data.goal || !data.goal.trim()) {
    return { success: false, error: 'Please select your primary goal' };
  }

  try {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.from('chatman_leads').insert({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      company: data.company?.trim() || null,
      industry: data.industry?.trim() || null,
      goal: data.goal.trim(),
      urgency: data.urgency?.trim() || null,
      current_tools: data.currentTools?.trim() || null,
      wants_demo: data.wantsDemo || false,
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
