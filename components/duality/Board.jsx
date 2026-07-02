"use client";
import React, { useEffect, useRef } from "react";
import { GRID, skinOf } from "./rules";
import { S } from "./theme";

// Tabuleiro em canvas. Desenha lados, imagens mascaradas, Eternos e — v2 —
// o EMBLEMA que cada jogador escolhe, cravado nos blocos que conquistou.
export default function Board({ cells, justWon, cfg, imgA, imgB, tick, dimmed, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const draw = () => {
      const w = cv.clientWidth, h = cv.clientWidth;
      cv.width = w * DPR; cv.height = h * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const cell = w / GRID; const won = new Set(justWon);
      for (let p = 0; p < GRID * GRID; p++) {
        const s = cells[p].side; const x = (p % GRID) * cell, y = ((p / GRID) | 0) * cell;
        ctx.globalAlpha = dimmed ? .55 : 1;
        ctx.fillStyle = s === "a" ? cfg.colorA : cfg.colorB;
        ctx.fillRect(x, y, cell + .6, cell + .6);
        if (won.has(p)) { ctx.fillStyle = "#fff"; ctx.globalAlpha = .65; ctx.fillRect(x, y, cell + .6, cell + .6); }
      }
      ctx.globalAlpha = dimmed ? .55 : 1;
      const mask = (img, who) => {
        if (!img) return;
        ctx.save(); ctx.beginPath();
        for (let p = 0; p < GRID * GRID; p++) if (cells[p].side === who) { const x = (p % GRID) * cell, y = ((p / GRID) | 0) * cell; ctx.rect(x, y, cell + .6, cell + .6); }
        ctx.clip();
        const ar = img.width / img.height; let dw = w, dh = w / ar; if (dh > w) { dh = w; dw = w * ar; }
        ctx.globalAlpha = dimmed ? .5 : .92;
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        ctx.restore();
      };
      mask(imgA?.current, "a"); mask(imgB?.current, "b");
      // emblemas dos conquistadores (personalização no mapa)
      ctx.globalAlpha = dimmed ? .5 : .9;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (let p = 0; p < GRID * GRID; p++) {
        const c = cells[p];
        if (c.eternal || !c.flair || !c.name) continue;
        const x = (p % GRID) * cell, y = ((p / GRID) | 0) * cell;
        ctx.font = `${cell * .55}px sans-serif`;
        ctx.fillText(c.flair, x + cell / 2, y + cell / 2 + .5);
      }
      ctx.globalAlpha = 1;
      for (let p = 0; p < GRID * GRID; p++) {
        if (!cells[p].eternal) continue;
        const x = (p % GRID) * cell, y = ((p / GRID) | 0) * cell;
        ctx.save();
        ctx.shadowColor = "#fff"; ctx.shadowBlur = 12; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, cell - 1.4, cell - 1.4);
        ctx.shadowBlur = 0; ctx.fillStyle = "#fff";
        ctx.font = `bold ${cell * .7}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(cells[p].flair || "★", x + cell / 2, y + cell / 2 + .5);
        ctx.restore();
      }
    };
    draw();
    const onR = () => draw();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, [cells, justWon, cfg, tick, dimmed]);
  return (
    <div style={{ ...S.boardWrap, boxShadow: skinOf(cfg.skin).boardShadow, ...style }}>
      <canvas ref={ref} style={S.board} />
    </div>
  );
}
