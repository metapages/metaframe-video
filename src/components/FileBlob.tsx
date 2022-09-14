export interface FileBlob {
  name: string;
  file?: File|Blob;
  urlEncoded?: string;
  cached: boolean;
}
