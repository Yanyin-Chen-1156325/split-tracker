"use client";

import { useState } from "react";
import { evaluate } from "mathjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Delete } from "lucide-react";

interface CalculatorProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  initialValue?: string;
}

const BUTTONS = [
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "C", "+"],
];

export function Calculator({ open, onClose, onConfirm, initialValue = "" }: CalculatorProps) {
  const [expression, setExpression] = useState(initialValue);
  const [error, setError] = useState(false);

  function handleButton(val: string) {
    setError(false);
    if (val === "C") {
      setExpression("");
      return;
    }
    setExpression((prev) => prev + val);
  }

  function handleBackspace() {
    setExpression((prev) => prev.slice(0, -1));
    setError(false);
  }

  function handleConfirm() {
    try {
      const result = evaluate(expression);
      if (typeof result !== "number" || !isFinite(result) || result < 0) {
        setError(true);
        return;
      }
      const rounded = Math.round(result * 100) / 100;
      onConfirm(rounded);
      onClose();
    } catch {
      setError(true);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onClose();
    if (e.key === "Backspace") handleBackspace();
    if ("0123456789+-*/.".includes(e.key)) {
      setExpression((prev) => prev + e.key);
      setError(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-72 p-0 overflow-hidden" onKeyDown={handleKeyDown}>
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base">Calculator</DialogTitle>
        </DialogHeader>

        {/* Display */}
        <div className="px-4 pb-3">
          <div
            className={`bg-muted rounded-lg px-4 py-3 text-right font-mono text-xl min-h-[56px] flex items-center justify-end ${
              error ? "text-destructive" : ""
            }`}
          >
            {expression || "0"}
          </div>
          {error && (
            <p className="text-destructive text-xs mt-1 text-right">Invalid expression</p>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-1 px-4 pb-4">
          {BUTTONS.flat().map((btn) => (
            <Button
              key={btn}
              variant={["/", "*", "-", "+"].includes(btn) ? "secondary" : "outline"}
              className="h-12 text-base font-medium"
              onClick={() => handleButton(btn)}
            >
              {btn === "*" ? "×" : btn === "/" ? "÷" : btn}
            </Button>
          ))}

          <Button
            variant="outline"
            className="h-12"
            onClick={handleBackspace}
          >
            <Delete className="w-4 h-4" />
          </Button>

          <Button
            className="col-span-3 h-12 text-base font-semibold"
            onClick={handleConfirm}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
