import { ImageResponse } from "next/og";

export const alt = "Homes by Fattori — Hand-Drawn Luxury Home Portraits";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1A2E4A",
          color: "#FAF8F3",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "1px solid rgba(184, 150, 80, 0.5)",
            padding: "64px 96px",
          }}
        >
          <div
            style={{
              fontSize: 26,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#B89650",
            }}
          >
            Bespoke Architectural Portraits
          </div>
          <div
            style={{
              marginTop: 36,
              fontSize: 78,
              letterSpacing: "0.12em",
              textAlign: "center",
            }}
          >
            HOMES BY FATTORI
          </div>
          <div
            style={{
              marginTop: 36,
              width: 96,
              height: 2,
              backgroundColor: "#B89650",
            }}
          />
          <div
            style={{
              marginTop: 32,
              fontSize: 30,
              fontStyle: "italic",
              color: "rgba(250, 248, 243, 0.85)",
            }}
          >
            Your Home, Drawn by Hand.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
