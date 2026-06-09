"use client";

import { useEffect, useTransition } from "react";
import { markTaskMessagesRead } from "@/app/message-actions";

type MarkMessagesReadProps = {
  taskId: string;
  enabled: boolean;
};

export function MarkMessagesRead({ taskId, enabled }: MarkMessagesReadProps) {
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!enabled) return;
    startTransition(() => {
      void markTaskMessagesRead(taskId);
    });
  }, [enabled, taskId]);

  return null;
}
