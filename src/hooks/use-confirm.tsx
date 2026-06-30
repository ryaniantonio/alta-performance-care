import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
  /** Dialog title (required). */
  title: string;
  /** Optional supporting text. */
  description?: ReactNode;
  /** Confirm button label. Default: "Confirmar". */
  confirmLabel?: string;
  /** Cancel button label. Default: "Cancelar". */
  cancelLabel?: string;
  /** Style the confirm button as destructive (red). */
  destructive?: boolean;
}

/**
 * Promise-based confirmation dialog — the in-app replacement for the native
 * `window.confirm()`. No provider needed: the hook owns its dialog state and
 * returns the element to render. Usage:
 *
 * ```tsx
 * const { confirm, confirmDialog } = useConfirm();
 * // ...
 * const ok = await confirm({ title: "Excluir paciente?", destructive: true });
 * if (!ok) return;
 * // ...
 * return (
 *   <>
 *     {/* ... *\/}
 *     {confirmDialog}
 *   </>
 * );
 * ```
 *
 * Resolves `true` on confirm, `false` on cancel or dismissal (Esc / overlay).
 */
export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((result: boolean) => void) | null>(null);

  const settle = useCallback((result: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setOpen(false);
    resolve?.(result);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const confirmDialog = (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Dismissal (Esc / overlay click) resolves as "cancel".
        if (!next) settle(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options?.title}</AlertDialogTitle>
          {options?.description && (
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => settle(false)}>
            {options?.cancelLabel ?? "Cancelar"}
          </AlertDialogCancel>
          <AlertDialogAction
            className={
              options?.destructive ? cn(buttonVariants({ variant: "destructive" })) : undefined
            }
            onClick={() => settle(true)}
          >
            {options?.confirmLabel ?? "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, confirmDialog };
}
