import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface BottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
	const contentRef = useRef<HTMLDivElement>(null);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		},
		[onClose],
	);

	useEffect(() => {
		if (isOpen) {
			window.scrollTo({ top: 0 });
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
			return () => {
				document.removeEventListener("keydown", handleKeyDown);
				document.body.style.overflow = "";
			};
		}
	}, [isOpen, handleKeyDown]);

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						aria-hidden="true"
					/>
					<motion.div
						role="dialog"
						aria-modal="true"
						ref={contentRef}
						className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-2xl max-h-[85vh] flex flex-col"
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						drag="y"
						dragConstraints={{ top: 0 }}
						dragElastic={0.2}
						onDragEnd={(_, info) => {
							if (info.offset.y > 100 || info.velocity.y > 500) onClose();
						}}
					>
						<div className="flex justify-center pt-3 pb-4 cursor-grab active:cursor-grabbing">
							<span
								className="w-10 h-1 rounded-full bg-text-muted/30"
								aria-hidden="true"
							/>
						</div>
						<div className="flex flex-col gap-4 overflow-y-auto px-6 pb-8">
							{children}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>,
		document.body,
	);
}
