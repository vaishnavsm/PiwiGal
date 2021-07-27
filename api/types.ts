
export interface ImageType {
  url: string;
  square: string;
  name: string;
  page: number;
  id: string;
  width: number;
  height: number;
};

export type AlbumType = {
  rank: string,
  id: number,
  name: string,
  numImages: number,
  image: string, 
}

export type TagType = {
  id: number,
  name: string,
  count: number,
  toDelete?: boolean,
  existing?: boolean,
  toAdd?: boolean,
};