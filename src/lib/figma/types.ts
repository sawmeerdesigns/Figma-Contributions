// Raw shapes from the Figma REST API. Only lib/figma and the sync script should use these.

export type FigmaVersion = {
  id: string;
  created_at: string;
  label?: string | null;
  description?: string | null;
  user?: {
    id: string;
    handle: string;
    img_url?: string;
  };
};

export type FigmaVersionsResponse = {
  versions?: FigmaVersion[];
  pagination?: {
    prev_page?: string;
    next_page?: string;
  };
};
