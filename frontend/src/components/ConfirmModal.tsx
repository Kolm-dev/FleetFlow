import type { ReactNode } from "react";

type ConfirmModalProps = {
    isOpen: boolean;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    isConfirming?: boolean;
    children?: ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
};

export const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isConfirming = false,
    children,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal" role="dialog" aria-modal="true">
            <div className="confirm-modal__content">
                <h2>{title}</h2>

                {message && <p>{message}</p>}
                {children}

                <div className="confirm-modal__actions">
                    <button
                        type="button"
                        className="confirm-modal__confirm"
                        disabled={isConfirming}
                        onClick={onConfirm}
                    >
                        {isConfirming ? "Processing..." : confirmText}
                    </button>
                    <button
                        type="button"
                        className="confirm-modal__cancel"
                        disabled={isConfirming}
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};
