"use client";

import { createContext, useContext, useState } from "react";
import { KudosFormDialog } from "@/app/(site)/_components/kudos-form/kudos-form-dialog";

interface ComposerContextValue {
  /** Open the form, optionally pre-filling a recipient. */
  open: (recipientId?: string) => void;
}

const ComposerContext = createContext<ComposerContextValue | null>(null);

/** Access the Kudos composer from any client component inside KudosComposerProvider. */
export function useKudosComposer(): ComposerContextValue {
  const ctx = useContext(ComposerContext);
  if (!ctx) throw new Error("useKudosComposer must be used inside KudosComposerProvider");
  return ctx;
}

interface Props {
  children: React.ReactNode;
}

/**
 * Provides a single KudosFormDialog instance for the entire Kudos Live Board.
 * Any child can call `useKudosComposer().open(recipientId?)` to open the form,
 * optionally pre-filling the recipient.
 */
export function KudosComposerProvider({ children }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [recipientId, setRecipientId] = useState<string | undefined>(undefined);
  // Incrementing key forces KudosFormDialog to remount on each open so the
  // lazy useState initializer picks up the new defaultRecipientId cleanly.
  const [openKey, setOpenKey] = useState(0);

  function open(id?: string) {
    setRecipientId(id);
    setOpenKey((k) => k + 1);
    setFormOpen(true);
  }

  return (
    <ComposerContext.Provider value={{ open }}>
      {children}
      <KudosFormDialog
        key={openKey}
        open={formOpen}
        onOpenChange={(v) => {
          if (!v) setFormOpen(false);
        }}
        defaultRecipientId={recipientId}
      />
    </ComposerContext.Provider>
  );
}
