export interface FormData {
  nombre: string;
  noFactura: string;
  observaciones: string;
  nit: string;
}

export type ObservacionType =
  | "PAGO FACTURA"
  | "GIRO HONORARIOS ADMINISTRACION OBRA"
  | "GIRO DE RECURSOS FONDO ROTATORIO";

export const OBSERVACIONES_OPTIONS: ObservacionType[] = [
  "PAGO FACTURA",
  "GIRO HONORARIOS ADMINISTRACION OBRA",
  "GIRO DE RECURSOS FONDO ROTATORIO",
];
