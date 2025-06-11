import { nanoid } from 'nanoid';
import { User, Post, Story } from '../types';
import {
  maleFirstNames,
  femaleFirstNames,
  lastNames,
  bios,
  interests,
  locations,
  postCaptions
} from './mockData/constants';

function generateStories(userId: string): Story[] {
  return Array.from({ length: 3 }, () => ({
    id: nanoid(),
    mediaUrl: `https://picsum.photos/800/1200?random=${nanoid()}`,
    caption: 'Story moment ✨',
    timestamp: new Date().toISOString()
  }));
}

function generateUser(gender: 'male' | 'female', index: number): User {
  const id = nanoid();
  const firstName = gender === 'male' 
    ? maleFirstNames[index % maleFirstNames.length]
    : femaleFirstNames[index % femaleFirstNames.length];
  const lastName = lastNames[index % lastNames.length];
  const name = `${firstName} ${lastName}`;
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${index}`;
  
  const userInterests = Array.from({ length: 3 }, () => 
    interests[Math.floor(Math.random() * interests.length)]
  );

  return {
    id,
    name,
    dpUrl: `https://i.pravatar.cc/300?img=${index}${gender === 'male' ? 'm' : 'f'}`,
    bio: gender === 'male' 
      ? bios.male[index % bios.male.length]
      : bios.female[index % bios.female.length],
    gender,
    age: Math.floor(Math.random() * (45 - 18) + 18),
    distance: Math.floor(Math.random() * 250),
    interests: Array.from(new Set(userInterests)),
    links: {
      Twitter: `https://twitter.com/${username}`,
      Instagram: `https://instagram.com/${username}`,
      LinkedIn: `https://linkedin.com/in/${username}`,
    },
    stories: generateStories(id)
  };
}

export const mockUsers = {
  male: Array.from({ length: 10 }, (_, i) => generateUser('male', i)),
  female: Array.from({ length: 10 }, (_, i) => generateUser('female', i))
};

export function generatePosts(user: User): Post[] {
  return Array.from({ length: 6 }, () => ({
    id: nanoid(),
    userId: user.id,
    userName: user.name,
    userDpUrl: user.dpUrl,
    title: `Post by ${user.name}`,
    mediaUrl: `https://picsum.photos/800/600?random=${nanoid()}`,
    caption: postCaptions[Math.floor(Math.random() * postCaptions.length)],
    timestamp: new Date().toISOString(),
    location: locations[Math.floor(Math.random() * locations.length)]
  }));
}