import type { BandKey } from "./domain/bands";

// Response DTOs. The API serializers produce exactly these shapes; the web app consumes them.

export type PublicOption = { id: number; label: string };
export type PublicQuestion = {
  id: number;
  position: number;
  text: string;
  options: PublicOption[];
};
export type PublicQuiz = {
  slug: string;
  title: string;
  subtitle: string | null;
  questions: PublicQuestion[];
};

export type AnswerSummary = { position: number; question: string; answer: string };

export type BandDTO = { key: BandKey; label: string; message: string };

export type SubmissionResult = {
  resultId: string;
  firstName: string;
  score: number;
  band: BandDTO;
  answers: AnswerSummary[];
};

export type LeadListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  band: BandDTO;
  createdAt: string;
};

export type LeadDetail = LeadListItem & {
  quiz: { slug: string; title: string };
  answers: (AnswerSummary & { weight: number })[];
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type LeadStats = {
  total: number;
  last7Days: number;
  averageScore: number | null;
  byBand: { key: BandKey; label: string; count: number }[];
  byDay: { date: string; count: number }[];
};

export type AdminSession = { id: number; email: string };
