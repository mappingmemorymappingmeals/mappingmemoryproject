import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Shared pedagogical Q&A accordion — used by DetailDrawer, TourOverlay and
// SnapshotDialog. Uses the question text itself as the stable React key.
export function QaList({ qa, testId, triggerClassName = "text-[16.5px] text-[#e8dcc5]", answerClassName = "text-[16px]" }) {
  if (!qa || qa.length === 0) return null;
  return (
    <Accordion type="single" collapsible className="w-full" data-testid={testId}>
      {qa.map((pair, i) => {
        const stableKey = pair.q || `qa-${i}`;
        return (
          <AccordionItem key={stableKey} value={stableKey} className="border-[hsl(26_14%_18%)]">
            <AccordionTrigger className={`${triggerClassName} hover:no-underline text-left py-3`}>
              <span>
                <span className="font-mono text-[#e3b448] mr-2">{i + 1}.</span>
                {pair.q}
              </span>
            </AccordionTrigger>
            {pair.a && (
              <AccordionContent>
                <p className={`${answerClassName} leading-relaxed text-[#cfc4ae] pl-6 border-l-2 border-[#e3b44855]`}>{pair.a}</p>
              </AccordionContent>
            )}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
