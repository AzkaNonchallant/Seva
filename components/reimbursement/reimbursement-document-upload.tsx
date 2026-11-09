"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { uploadTravelDocumentAction } from "@/app/actions/travel-actions";
import { Button } from "@/components/ui/button";

export function ReimbursementDocumentUpload({ travelId }: { travelId: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(uploadTravelDocumentAction, null);

  useEffect(() => {
    if (state?.ok) {
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="travelId" value={travelId} />
      <input ref={inputRef} name="file" type="file" accept="application/pdf,.pdf" required className="block min-h-11 w-full p-2 text-sm" />
      <p className="text-xs text-tertiary">PDF maksimal 10 MB. File disimpan sebagai dokumen pada travel terkait.</p>
      <Button type="submit" icon="upload_file" disabled={pending}>
        {pending ? "Mengunggah..." : "Unggah PDF"}
      </Button>
      {state && !state.ok ? <p className="text-caption text-error" role="alert">{state.message}</p> : null}
      {state?.ok ? <p className="text-caption text-success" role="status">{state.message}</p> : null}
    </form>
  );
}
