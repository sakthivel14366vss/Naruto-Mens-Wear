// src/lib/common/store/toast.ts
import { writable } from 'svelte/store';

export type ToastType = {
  message: string;
  id: number;
  type: 'red' | 'green' | 'white' | 'blue';
};

const toastList = writable<ToastType[]>([]);

export const toastStore = {
  subscribe: toastList.subscribe,

  show(message: string, type: ToastType['type'] = 'white') {
    const id = Date.now();

    toastList.update((list) => [...list, { message, id, type }]);

    // auto remove
    setTimeout(() => {
      this.remove(id);
    }, 3000);
  },

  remove(id: number) {
    toastList.update((list) => list.filter((t) => t.id !== id));
  },
};
