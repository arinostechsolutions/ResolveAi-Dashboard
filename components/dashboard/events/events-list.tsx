"use client";

import { Edit, Trash2, Calendar, MapPin, Image as ImageIcon, Users, CheckCircle2, XCircle } from "lucide-react";
import moment from "moment-timezone";
import type { Event } from "@/hooks/use-events";
import { useDeleteEvent } from "@/hooks/use-events";

interface EventsListProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

export function EventsList({ events, onEdit, onDelete }: EventsListProps) {
  const deleteEvent = useDeleteEvent();

  const handleDelete = async (eventId: string) => {
    if (!confirm("Tem certeza que deseja deletar este evento?")) {
      return;
    }
    deleteEvent.mutate(eventId, {
      onSuccess: () => {
        onDelete(eventId);
      },
    });
  };

  const isEventFinished = (event: Event) => {
    return moment(event.endDate).isBefore(moment());
  };

  const isEventOngoing = (event: Event) => {
    const now = moment();
    return moment(event.startDate).isBefore(now) && moment(event.endDate).isAfter(now);
  };

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-12 text-center">
        <p className="text-slate-400">Nenhum evento cadastrado ainda.</p>
        <p className="text-slate-500 text-sm mt-2">
          Clique em "Criar Evento" para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const finished = isEventFinished(event);
        const ongoing = isEventOngoing(event);

        return (
          <div
            key={event._id}
            className={`rounded-lg border ${
              finished
                ? "border-slate-600 bg-slate-800/30"
                : ongoing
                ? "border-emerald-500/50 bg-emerald-500/10"
                : "border-slate-700 bg-slate-800/50"
            } p-6`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-slate-200">
                    {event.title}
                  </h4>
                  {finished && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-700 text-xs text-slate-400">
                      <XCircle className="size-3" />
                      Finalizado
                    </span>
                  )}
                  {ongoing && !finished && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                      <CheckCircle2 className="size-3" />
                      Em andamento
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="size-4 text-slate-400" />
                    <span>
                      {moment(event.startDate).format("DD/MM/YYYY HH:mm")} -{" "}
                      {moment(event.endDate).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </div>

                  {event.address?.coordinates && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="size-4 text-slate-400" />
                      <span>
                        {event.address.street || "Localização definida"}
                        {event.address.neighborhood && `, ${event.address.neighborhood}`}
                      </span>
                    </div>
                  )}

                  {event.images && event.images.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <ImageIcon className="size-4 text-slate-400" />
                      <span>{event.images.length} imagem(ns)</span>
                    </div>
                  )}

                  {event.sponsors && event.sponsors.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="size-4 text-slate-400" />
                      <span>{event.sponsors.length} patrocinador(es)</span>
                    </div>
                  )}

                  {event.schedule && event.schedule.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="size-4 text-slate-400" />
                      <span>{event.schedule.length} item(ns) na programação</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onEdit(event)}
                  className="rounded-lg border border-slate-600 bg-slate-700 p-2 text-slate-300 hover:bg-slate-600 transition-colors"
                  title="Editar evento"
                >
                  <Edit className="size-4" />
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="rounded-lg border border-red-500/50 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-colors"
                  title="Deletar evento"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

