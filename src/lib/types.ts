export interface RegistrationInput {
  ticketNumber: string;
  source: "REGISTROS" | "COMPRADOS";
  cip: string | null;
  lastName: string | null;
  firstName: string | null;
  chapter: string | null;
  specialty: string | null;
  phone: string | null;
  purchaseDate: Date | null;
  dish: string | null;
}

export interface Registration extends RegistrationInput {
  id: number;
  attended: boolean;
  checkinTime: Date | null;
  createdAt: Date;
}

export interface SearchResult {
  success: boolean;
  data?: Registration;
  error?: string;
}

export interface CheckinResult {
  success: boolean;
  message: string;
}

export interface UploadResult {
  success: boolean;
  counts: {
    inserted: number;
    updated: number;
  };
  errors: string[];
}

export interface ClearResult {
  success: boolean;
}

export interface DashboardStats {
  total: number;
  attended: number;
  pending: number;
  byDish: {
    pollo: number;
    chancho: number;
    sinPlato: number;
  };
  bySource: {
    registros: number;
    comprados: number;
  };
}
