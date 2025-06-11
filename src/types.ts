export interface User {
  id: string;
  name: string;
  dpUrl: string;
  bio: string;
  gender: 'male' | 'female';
  age: number;
  distance: number;
  interests: string[];
  links: {
    Twitter: string;
    Instagram: string;
    LinkedIn: string;
  };
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userDpUrl: string;
  title: string;
  mediaUrl: string;
  caption: string;
  timestamp: string;
  location?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Media {
  id: string;
  mediaUrl: string;
  caption?: string;
  timestamp: string;
}

export interface CurrentUser extends User {
  posterUrl: string;
  email: string;
  location: string;
  media: Media[];
  messages: Message[];
  posts: Post[];
}