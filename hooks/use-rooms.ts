"use client";

import { roomsApi } from "@/lib/api/services";
import type { RoomRecord, RoomPayload } from "@/lib/api/types";

export function useRooms() {
  const list = async () => {
    return roomsApi.list();
  };

  const get = async (id: string) => {
    return roomsApi.get(id);
  };

  const create = async (payload: RoomPayload) => {
    return roomsApi.create(payload);
  };

  const update = async (id: string, payload: RoomPayload) => {
    return roomsApi.update(id, payload);
  };

  const remove = async (id: string) => {
    return roomsApi.delete(id);
  };

  return {
    list,
    get,
    create,
    update,
    remove,
  };
}
