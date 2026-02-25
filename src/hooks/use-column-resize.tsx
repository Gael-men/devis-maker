import { useRef, useState, useCallback } from 'react';

export interface ColumnDef {
  key: string;
  defaultWidth: number;
  minWidth?: number;
}

export function useColumnResize(columns: ColumnDef[]) {
  const [widths, setWidths] = useState<Record<string, number>>(
    Object.fromEntries(columns.map((c) => [c.key, c.defaultWidth]))
  );
  const resizingRef = useRef<{ key: string; startX: number; startW: number } | null>(null);

  const startResize = useCallback(
    (e: React.MouseEvent, key: string) => {
      e.preventDefault();
      resizingRef.current = { key, startX: e.clientX, startW: widths[key] };

      const col = columns.find((c) => c.key === key);
      const minW = col?.minWidth ?? 40;

      const onMove = (ev: MouseEvent) => {
        if (!resizingRef.current) return;
        const delta = ev.clientX - resizingRef.current.startX;
        const newW = Math.max(minW, resizingRef.current.startW + delta);
        setWidths((prev) => ({ ...prev, [key]: newW }));
      };

      const onUp = () => {
        resizingRef.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [widths, columns]
  );

  return { widths, startResize };
}
