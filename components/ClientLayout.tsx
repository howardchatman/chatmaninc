'use client';

import { useState } from 'react';
import ChatWidget from '@/components/chat/ChatWidget';
import LeadCaptureModal from '@/components/LeadCaptureModal';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  return (
    <>
      {children}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
      />
      <ChatWidget onOpenLeadModal={() => setIsLeadModalOpen(true)} />
    </>
  );
}
