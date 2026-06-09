import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import type { ReactNode } from "react";

interface FormModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export const FormModal = ({
  open,
  title,
  children,
  onClose,
}: FormModalProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{children}</DialogContent>
  </Dialog>
);
