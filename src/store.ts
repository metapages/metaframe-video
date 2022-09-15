import create from "zustand";
import localForage from "localforage";
import videojs from "video.js";
import { FileBlob } from "./components/FileBlob";
export type Mode = "idle" | "running" | "cancelled" | "error" | "success";

interface FilesState {

  playSource: videojs.Tech.SourceObject | undefined;
  setPlaySource: (source: videojs.Tech.SourceObject | undefined) => void;

  files: FileBlob[];
  addFile: (file: FileBlob) => void;
  setFiles: (files: FileBlob[]) => void;
  getFile: (filename: string) => Promise<File|Blob>;
  cacheFile: (file: FileBlob) => void;
  syncCachedFiles: () => void;

  deleteFile: (filename: string) => Promise<void>;
  deleteAllFiles: () => Promise<void>;

  mode: Mode;
  setMode: (mode: Mode) => void;

  error: string | null;
  setError: (error: string | null) => void;
}

export const useFileStore = create<FilesState>((set, get) => ({

  playSource: undefined,
  setPlaySource: (playSource: videojs.Tech.SourceObject | undefined) => set((state) => ({ playSource })),

  files: [],
  setFiles: (files: FileBlob[]) => set((state) => ({ files })),

  getFile: async (filename: string) => {
    const fileBlob = get().files.find((file) => file.name === filename);
    if (!fileBlob) {
      throw new Error("File not found");
    }
    if (fileBlob.file) {
      return fileBlob.file;
    }

    if (!fileBlob.cached) {
      throw `File ${filename} is not cached`;
    }

    const fileFromCache: File | undefined | null = await localForage.getItem(
      fileBlob.name
    );
    if (fileFromCache) {
      fileBlob.cached = true;
      fileBlob.file = fileFromCache;
      // trigger updates
      set((state) => ({
        files: [...get().files],
      }));

      return fileFromCache;
    }

    throw `File not found: ${filename}`;
  },

  cacheFile: async (file: FileBlob) => {
    if (file.cached) {
      return;
    }

    if (!file.file) {
      throw `cacheFile failed, not file File not found for: ${file.name}`;
    }

    try {
      await localForage.setItem(file.name, file.file);
      file.cached = true;
      // trigger updates
      set((state) => ({
        files: [...get().files],
      }));
    } catch (err) {
      console.log(err);
    }
  },

  syncCachedFiles: async () => {
    const keys = await localForage.keys();

    const files = get().files;
    const newFiles: FileBlob[] = [];
    keys.forEach((key) => {
      if (!files.find((f) => f.name === key)) {
        newFiles.push({
          name: key,
          cached: true,
        });
      }
    });

    set((state) => ({
      files: [...files, ...newFiles],
    }));
  },

  addFile: async (file: FileBlob) => {
    set((state) => ({
      // overwrite if already exists
      files: [...state.files.filter((f) => f.name !== file.name), file],
    }));
  },

  deleteFile: async (filename: string) => {
    const files = [...get().files];
    const fileBlob = get().files.find((file) => file.name === filename);

    if (fileBlob) {
      files.splice(files.indexOf(fileBlob), 1);
      try {
        await localForage.removeItem(filename);
      } catch (err) {
        console.log(err);
      }
    }

    set((state) => ({
      files,
    }));
  },

  deleteAllFiles: async () => {
    get().files.forEach(async (file) => {
      try {
        await localForage.removeItem(file.name);
      } catch (err) {
        console.log(err);
      }
    });

    set((state) => ({
      files: [],
    }));

    return Promise.resolve();
  },

  mode: "idle",
  setMode: (mode: Mode) => set((state) => ({ mode })),

  error: null,
  setError: (error: string | null) => set((state) => ({ error })),
}));
