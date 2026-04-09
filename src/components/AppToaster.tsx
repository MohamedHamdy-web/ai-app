"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      richColors
      closeButton
      visibleToasts={4}
      offset={20}
      mobileOffset={16}
      toastOptions={{
        duration: 4200,
        classNames: {
          toast:
            "!rounded-[1.25rem] !border !border-white/12 !bg-[#06131c]/95 !text-white !shadow-2xl !shadow-black/35 !backdrop-blur-xl",
          title: "!text-sm !font-semibold !tracking-tight",
          description: "!text-sm !leading-6 !text-white/62",
          closeButton:
            "!border !border-white/10 !bg-white/[0.04] !text-white/72 hover:!bg-white/[0.08] hover:!text-white",
          actionButton:
            "!rounded-xl !bg-white !px-3 !py-2 !text-sm !font-semibold !text-slate-950 hover:!opacity-90",
          cancelButton:
            "!rounded-xl !border !border-white/10 !bg-white/[0.05] !px-3 !py-2 !text-sm !font-medium !text-white/82 hover:!bg-white/[0.08] hover:!text-white",
        },
      }}
    />
  );
}
