import React, { useState, useEffect } from 'react';
import { within, userEvent, expect } from '@storybook/test';
import { BrowserRouter } from 'react-router-dom';
import Journal from '../pages/Journal';
import { journalService } from '../services/journalService';
import { Album, Note } from '../components/journal/types';

type Meta<T> = {
  title: string;
  component: T;
  parameters?: any;
  tags?: string[];
  decorators?: ((Story: any) => React.ReactElement)[];
};

type StoryObj<T> = {
  render?: (args: any) => React.ReactElement;
  play?: (context: any) => Promise<void>;
};

const mockAlbums: Album[] = [
  {
    id: '1',
    title: 'First Month Memories',
    coverPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4NzVhYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Rmlyc3QgTW9udGg8L3RleHQ+PC9zdmc+',
    description: 'Baby\'s first month photos and moments',
    photos: [
      {
        id: 'p1',
        file: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZGRlNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GaXJzdCBTbWlsZTwvdGV4dD48L3N2Zz4=',
        name: 'First Smile',
        notes: 'Such a precious moment!',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'p2',
        file: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U3ZjRmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TbGVlcGluZzwvdGV4dD48L3N2Zz4=',
        name: 'Sleeping Beauty',
        notes: 'Peaceful sleep',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Family Moments',
    coverPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZGI1OCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RmFtaWx5PC90ZXh0Pjwvc3ZnPg==',
    description: 'Special family memories together',
    photos: [
      {
        id: 'p3',
        file: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZTRlMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GYW1pbHkgUGljPC90ZXh0Pjwvc3ZnPg==',
        name: 'Family Portrait',
        notes: 'All together',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockNotes: Note[] = [
  {
    id: 'n1',
    title: 'First Day Home',
    content: 'Bringing baby home was magical! The nursery looks perfect and everyone is so excited.',
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['milestone', 'home', 'first'],
    mood: 'happy',
  },
  {
    id: 'n2',
    title: 'Sleepless Night',
    content: 'Up every 2 hours but seeing that little face makes it all worth it. Learning so much every day.',
    photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2UwZTdmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OaWdodCBUaW1lPC90ZXh0Pjwvc3ZnPg==',
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['sleep', 'tired', 'newborn'],
    mood: 'tired',
  },
  {
    id: 'n3',
    title: 'First Pediatrician Visit',
    content: 'Everything looks great! Baby is growing well and hitting all the early milestones. Doctor said we\'re doing a great job.',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['doctor', 'health', 'milestone'],
    mood: 'relieved',
  },
  {
    id: 'n4',
    title: 'Tummy Time Success',
    content: 'Baby held head up during tummy time today! So proud of this little one.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['milestone', 'development', 'proud'],
    mood: 'proud',
  },
];

const JournalWrapper = ({ initialAlbums = [], initialNotes = [] }: { initialAlbums?: Album[], initialNotes?: Note[] }) => {
  useEffect(() => {
    const originalGetAlbums = journalService.getAlbums;
    const originalGetNotes = journalService.getNotes;
    const originalCreateAlbum = journalService.createAlbum;
    const originalCreateNote = journalService.createNote;
    const originalUpdateNote = journalService.updateNote;
    const originalDeleteNote = journalService.deleteNote;
    const originalUpdateAlbum = journalService.updateAlbum;
    const originalDeleteAlbum = journalService.deleteAlbum;
    const originalAddPhotos = journalService.addPhotosToAlbum;
    const originalUpdatePhoto = journalService.updatePhoto;
    const originalDeletePhoto = journalService.deletePhoto;

    journalService.getAlbums = async () => {
      console.log('Mock: Getting albums', initialAlbums);
      return { success: true, data: initialAlbums };
    };

    journalService.getNotes = async () => {
      console.log('Mock: Getting notes', initialNotes);
      return { success: true, data: initialNotes };
    };

    journalService.createAlbum = async (data: any) => {
      console.log('Mock: Creating album', data);
      const newAlbum: Album = {
        id: String(Date.now()),
        title: data.title,
        coverPhoto: data.coverPhoto,
        description: data.description,
        photos: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      return { success: true, data: newAlbum };
    };

    journalService.createNote = async (data: any) => {
      console.log('Mock: Creating note', data);
      const newNote: Note = {
        id: String(Date.now()),
        title: data.title,
        content: data.content,
        photo: data.photo,
        tags: data.tags || [],
        mood: data.mood || '',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      return { success: true, data: newNote };
    };

    journalService.updateNote = async (id: string, data: any) => {
      console.log('Mock: Updating note', id, data);
      return { success: true, data: { id, ...data } as Note };
    };

    journalService.deleteNote = async (id: string) => {
      console.log('Mock: Deleting note', id);
      return { success: true };
    };

    journalService.updateAlbum = async (id: string, data: any) => {
      console.log('Mock: Updating album', id, data);
      return { success: true, data: { id, ...data } as Album };
    };

    journalService.deleteAlbum = async (id: string) => {
      console.log('Mock: Deleting album', id);
      return { success: true };
    };

    journalService.addPhotosToAlbum = async (albumId: string, photos: any[]) => {
      console.log('Mock: Adding photos to album', albumId, photos);
      const album = initialAlbums.find(a => a.id === albumId);
      if (album) {
        const newPhotos = photos.map((p, i) => ({
          id: `p${Date.now()}-${i}`,
          file: p.fileUrl,
          name: p.name,
          notes: p.notes,
          createdAt: new Date().toISOString(),
          uploadedAt: new Date().toISOString(),
        }));
        return { success: true, data: { ...album, photos: [...album.photos, ...newPhotos] } };
      }
      return { success: false };
    };

    journalService.updatePhoto = async (photoId: string, data: any) => {
      console.log('Mock: Updating photo', photoId, data);
      return { success: true };
    };

    journalService.deletePhoto = async (photoId: string) => {
      console.log('Mock: Deleting photo', photoId);
      return { success: true };
    };

    return () => {
      journalService.getAlbums = originalGetAlbums;
      journalService.getNotes = originalGetNotes;
      journalService.createAlbum = originalCreateAlbum;
      journalService.createNote = originalCreateNote;
      journalService.updateNote = originalUpdateNote;
      journalService.deleteNote = originalDeleteNote;
      journalService.updateAlbum = originalUpdateAlbum;
      journalService.deleteAlbum = originalDeleteAlbum;
      journalService.addPhotosToAlbum = originalAddPhotos;
      journalService.updatePhoto = originalUpdatePhoto;
      journalService.deletePhoto = originalDeletePhoto;
    };
  }, []);

  return <Journal />;
};

const meta: Meta<typeof Journal> = {
  title: 'Pages/Journal',
  component: Journal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof JournalWrapper>;

export const Empty: Story = {
  render: () => <JournalWrapper initialAlbums={[]} initialNotes={[]} />,
};

export const WithAlbums: Story = {
  render: () => <JournalWrapper initialAlbums={mockAlbums} initialNotes={[]} />,
};

export const WithNotes: Story = {
  render: () => <JournalWrapper initialAlbums={[]} initialNotes={mockNotes} />,
};

export const WithBothAlbumsAndNotes: Story = {
  render: () => <JournalWrapper initialAlbums={mockAlbums} initialNotes={mockNotes} />,
};

export const SingleAlbum: Story = {
  render: () => <JournalWrapper initialAlbums={[mockAlbums[0]]} initialNotes={[]} />,
};

export const SingleNote: Story = {
  render: () => <JournalWrapper initialAlbums={[]} initialNotes={[mockNotes[0]]} />,
};

export const ManyAlbums: Story = {
  render: () => <JournalWrapper 
    initialAlbums={[
      ...mockAlbums,
      {
        id: '3',
        title: 'Playtime Fun',
        coverPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzk5ZjZlNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UGxheXRpbWU8L3RleHQ+PC9zdmc+',
        description: 'Fun and games with baby',
        photos: [],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]} 
    initialNotes={[]} 
  />,
};

export const InteractiveTabSwitch: Story = {
  render: () => <JournalWrapper initialAlbums={mockAlbums} initialNotes={mockNotes} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const notesButton = canvas.getByRole('button', { name: /Notes/i });
    await userEvent.click(notesButton);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await expect(canvas.getByText('First Day Home')).toBeInTheDocument();
    
    const albumsButton = canvas.getByRole('button', { name: /Photo Albums/i });
    await userEvent.click(albumsButton);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await expect(canvas.getByText('First Month Memories')).toBeInTheDocument();
  },
};

export const SearchFunctionality: Story = {
  render: () => <JournalWrapper initialAlbums={mockAlbums} initialNotes={mockNotes} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const searchInput = canvas.getByPlaceholderText(/Search albums/i);
    await userEvent.type(searchInput, 'Family', { delay: 100 });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await expect(canvas.getByText('Family Moments')).toBeInTheDocument();
  },
};
