export interface Report {
  id: string;
  title: string;
  description: string;
  data: { label: string; value: number }[];
}

export interface Setting {
  key: string;
  value: string;
  description?: string;
}
