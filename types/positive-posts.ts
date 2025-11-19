export type PositivePostCategory =
  | "obra_finalizada"
  | "melhoria_urbana"
  | "evento_cultural"
  | "servico_publico"
  | "infraestrutura"
  | "outro";

export type PositivePostStatus = "rascunho" | "publicado" | "arquivado";

export type PositivePostImage = {
  url: string;
  order: number;
};

export type PositivePost = {
  _id: string;
  title: string;
  description: string;
  images: PositivePostImage[];
  eventDate: string;
  location: {
    address: string;
    bairro?: string;
    rua?: string;
    referencia?: string;
    coordinates?: {
      type: "Point";
      coordinates: [number, number];
    };
    lat?: number;
    lng?: number;
  };
  city: {
    id: string;
    label: string;
  };
  category: PositivePostCategory;
  status: PositivePostStatus;
  createdBy: {
    adminId: string;
    adminName: string;
    secretaria?: string;
  };
  likesCount: number;
  viewsCount: number;
  sharesCount: number;
  engagementScore: number;
  createdAt: string;
  updatedAt: string;
};

export type PositivePostsFeedResponse = {
  cityId: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  posts: PositivePost[];
};

export type CreatePositivePostPayload = {
  title: string;
  description: string;
  images: string[] | PositivePostImage[];
  eventDate: string;
  location: {
    address: string;
    bairro?: string;
    rua?: string;
    referencia?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  city: {
    id: string;
    label: string;
  };
  category: PositivePostCategory;
  status?: PositivePostStatus;
};

export type UpdatePositivePostPayload = Partial<CreatePositivePostPayload>;

