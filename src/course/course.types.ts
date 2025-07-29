export interface VideoItem {
  id: string;
  title: string;
  durationInSeconds: number;
}

export interface CourseRes {
  videos: VideoItem[];
}
