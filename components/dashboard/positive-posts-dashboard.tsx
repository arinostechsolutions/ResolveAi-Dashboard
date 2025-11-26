"use client";

import { useState } from "react";
import { useCity } from "@/context/city-context";
import { PositivePostsList } from "./positive-posts-list";
import { PositivePostFormModal } from "./positive-post-form-modal";
import type { PositivePost } from "@/types/positive-posts";

export function PositivePostsDashboard() {
  const { cityId } = useCity();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PositivePost | null>(null);

  const handleCreateClick = () => {
    setEditingPost(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (post: PositivePost) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPost(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-200">Posts Positivos</h1>
        <p className="mt-1 text-sm text-slate-400">
          Gerencie posts positivos da prefeitura para o feed do aplicativo
        </p>
      </div>

      {/* Lista de Posts */}
      <PositivePostsList
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
      />

      {/* Modal de Formulário */}
      <PositivePostFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        post={editingPost}
      />
    </div>
  );
}




