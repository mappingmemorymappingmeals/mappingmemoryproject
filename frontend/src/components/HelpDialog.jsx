import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TribalIcon, WarliStrip } from "@/components/TribalIcons";
import { HELP_CONTENT } from "@/lib/constants";

export default function HelpDialog({ open, onOpenChange, lang }) {
  const H = HELP_CONTENT[lang] || HELP_CONTENT.en;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mmm-panel border-[hsl(26_14%_22%)] max-w-2xl max-h-[88vh] flex flex-col" data-testid="help-dialog">
        <DialogHeader>
          <DialogTitle className="text-[#f2ece1] text-2xl flex items-center gap-3 font-bold" style={{ fontFamily: "var(--font-display)" }}>
            <span className="w-11 h-11 rounded-xl bg-[#d07a3a] flex items-center justify-center">
              <TribalIcon name="weave" size={22} color="#1a120a" />
            </span>
            {H.title}
          </DialogTitle>
          <DialogDescription className="text-[#c9bda6] text-base">{H.intro}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 pr-3 overflow-y-auto" style={{ maxHeight: "62vh" }} data-testid="help-scroll-area">
          <div className="space-y-4 py-2">
            {H.items.map((item, i) => (
              <div key={item.h} className="flex gap-4 items-start rounded-2xl border border-[hsl(26_14%_20%)] bg-[hsl(26_18%_11%)] p-4" data-testid={`help-item-${i}`}>
                <div className="w-14 h-14 rounded-xl bg-[hsl(26_20%_15%)] border border-[#d07a3a55] flex items-center justify-center shrink-0">
                  <TribalIcon name={item.icon} size={28} color="#d3a273" />
                </div>
                <div>
                  <p className="text-[20px] font-bold text-[#f2ece1] mb-1" style={{ fontFamily: "var(--font-display)" }}>{item.h}</p>
                  <p className="text-[17px] leading-relaxed text-[#cfc4ae]">{item.t}</p>
                </div>
              </div>
            ))}
            <div className="flex justify-center pt-2">
              <WarliStrip count={7} size={18} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
