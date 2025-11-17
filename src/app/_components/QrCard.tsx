"use client";

import QRCode from "react-qr-code";

type QrCardProps = {
  value: string;
  label?: string;
  color?: string;
  bgColor?: string;
  widthMm?: number;
  heightMm?: number;
  showLabel?: boolean;
  showValue?: boolean;
  qrSizePercent?: number;
  labelFontSize?: number;
  valueFontSize?: number;
  orientation?: "portrait" | "landscape";
};

export function QrCard({
  value,
  label,
  color = "#000000",
  bgColor = "#FFFFFF",
  widthMm = 40,
  heightMm = 40,
  showLabel = true,
  showValue = true,
  qrSizePercent = 70,
  labelFontSize = 8,
  valueFontSize = 6,
  orientation = "portrait",
}: QrCardProps) {
  // Ajusta dimensões baseado na orientação
  const actualWidth = orientation === "landscape" ? heightMm : widthMm;
  const actualHeight = orientation === "landscape" ? widthMm : heightMm;
  // Melhor cálculo de conversão mm para pixels (para impressão e tela)
  const mmToPx = 4; // Fator de conversão mais preciso
  const widthPx = actualWidth * mmToPx;
  const heightPx = actualHeight * mmToPx;

  // Calcula alturas dos textos com base no tamanho da fonte
  const labelHeight = showLabel && label ? labelFontSize * 1.5 + 4 : 0;
  const valueHeight = showValue ? valueFontSize * 1.5 + 4 : 0;
  const totalPadding = 16; // 8px de padding em cada lado

  // Espaço disponível para o QR code
  const availableWidth = widthPx - totalPadding;
  const availableHeight = heightPx - labelHeight - valueHeight - totalPadding;

  // Tamanho do QR code baseado no espaço disponível e porcentagem
  const baseSize = Math.min(availableWidth, availableHeight);
  const qrSize = Math.max(
    24,
    Math.min(300, Math.floor(baseSize * (qrSizePercent / 100)))
  );

  // Estilos dinâmicos para melhor aproveitamento do espaço
  const containerStyle = {
    width: `${actualWidth}mm`,
    height: `${actualHeight}mm`,
    pageBreakInside: "avoid" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: `${labelFontSize}px`,
    lineHeight: 1.2,
    margin: showLabel && label ? "0 0 2px 0" : "0",
    maxHeight: `${labelFontSize * 1.5}px`,
    overflow: "hidden" as const,
    color: color,
  };

  const valueStyle = {
    fontSize: `${valueFontSize}px`,
    lineHeight: 1.2,
    margin: showValue ? "2px 0 0 0" : "0",
    maxHeight: `${valueFontSize * 1.5}px`,
    overflow: "hidden" as const,
    color: color,
  };

  return (
    <div
      className="border rounded-md bg-white text-center"
      style={{
        ...containerStyle,
        borderColor: color,
      }}
    >
      {showLabel && label && (
        <div
          className="font-semibold break-words w-full text-center"
          style={labelStyle}
        >
          {label.length > 30 ? `${label.substring(0, 30)}...` : label}
        </div>
      )}

      <div
        className="flex items-center justify-center"
        style={{
          flex: 1,
          minHeight: `${qrSize}px`,
          maxHeight: `${availableHeight}px`,
        }}
      >
        <QRCode
          value={value}
          size={qrSize}
          bgColor={bgColor}
          fgColor={color}
          level="M" // Nível de correção de erro médio para melhor legibilidade
        />
      </div>

      {showValue && (
        <div className="break-words w-full text-center" style={valueStyle}>
          {value.length > 40 ? `${value.substring(0, 40)}...` : value}
        </div>
      )}
    </div>
  );
}
