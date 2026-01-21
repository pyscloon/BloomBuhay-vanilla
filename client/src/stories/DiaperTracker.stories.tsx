import React, { useState, useRef } from 'react';
import DiaperTracker from '../components/tools/postpartum/DiaperTracker';
import { DiaperLog, bbtoolsService } from '../services/BBToolsService';

type Meta<T> = {
  title: string;
  component: T;
  parameters?: any;
  tags?: string[];
  argTypes?: any;
  decorators?: any[];
};

type StoryObj<T> = {
  args?: T;
  render?: (args: any) => React.ReactElement;
};

const DiaperTrackerWrapper = ({ initialDiapers }: { initialDiapers: DiaperLog[] }) => {
  const [diapers, setDiapers] = useState<DiaperLog[]>(initialDiapers);
  const mockDiaperId = useRef(100);
  
  const originalAdd = bbtoolsService.addDiaper;
  const originalUpdate = bbtoolsService.updateDiaper;
  const originalDelete = bbtoolsService.deleteDiaper;
  
  React.useEffect(() => {
    bbtoolsService.addDiaper = async (data: any) => {
      console.log('Mock: Adding diaper', data);
      const newEntry: DiaperLog = { 
        id: mockDiaperId.current++, 
        userId: 1,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setDiapers(prev => [newEntry, ...prev]);
      return { success: true, data: newEntry };
    };

    // Mock updateDiaper
    bbtoolsService.updateDiaper = async (id: string, data: any) => {
      console.log('Mock: Updating diaper', id, data);
      setDiapers(prev => prev.map(d => 
        d.id === Number(id) 
          ? { ...d, ...data, updatedAt: new Date().toISOString() }
          : d
      ));
      return { success: true, data: { id, ...data, updatedAt: new Date().toISOString() } };
    };

    // Mock deleteDiaper
    bbtoolsService.deleteDiaper = async (id: string) => {
      console.log('Mock: Deleting diaper', id);
      setDiapers(prev => prev.filter(d => d.id !== Number(id)));
      return { success: true };
    };

    // Cleanup: restore original methods when component unmounts
    return () => {
      bbtoolsService.addDiaper = originalAdd;
      bbtoolsService.updateDiaper = originalUpdate;
      bbtoolsService.deleteDiaper = originalDelete;
    };
  }, []);
  
  const handleRefresh = () => {
    console.log('Refresh triggered - state is already updated via mocks');
    // State is already updated by the mock functions above
  };

  return <DiaperTracker diapers={diapers} onRefresh={handleRefresh} />;
};

const mockDiaperLogs: DiaperLog[] = [
  {
    id: 1,
    userId: 1,
    diaperType: 'wet',
    occurredAt: new Date().toISOString(),
    notes: 'Normal wet diaper',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 1,
    diaperType: 'dirty',
    occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    color: 'yellow',
    consistency: 'seedy',
    notes: 'Normal breastfed stool',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    userId: 1,
    diaperType: 'both',
    occurredAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    color: 'brown',
    consistency: 'pasty',
    notes: 'Mixed feeding stool',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    userId: 1,
    diaperType: 'wet',
    occurredAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    userId: 1,
    diaperType: 'dirty',
    occurredAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    color: 'green',
    consistency: 'watery',
    notes: 'Loose stool - monitor for dehydration',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const yesterdayLog: DiaperLog = {
  id: 6,
  userId: 1,
  diaperType: 'wet',
  occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  notes: 'Previous day record',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const meta: Meta<typeof DiaperTracker> = {
  title: 'Tools/Postpartum/DiaperTracker',
  component: DiaperTracker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive diaper tracking component for monitoring baby\'s diaper changes, including wet and dirty diapers with color and consistency tracking. You can interact with the form to add, edit, and delete entries.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DiaperTrackerWrapper>;

export const Empty: Story = {
  render: () => <DiaperTrackerWrapper initialDiapers={[]} />,
};

export const SingleEntry: Story = {
  render: () => <DiaperTrackerWrapper initialDiapers={[mockDiaperLogs[0]]} />,
};

export const WithMultipleEntries: Story = {
  render: () => <DiaperTrackerWrapper initialDiapers={mockDiaperLogs} />,
};

export const WetDiapersOnly: Story = {
  render: () => <DiaperTrackerWrapper initialDiapers={mockDiaperLogs.filter(log => log.diaperType === 'wet')} />,
};

export const DirtyDiapersOnly: Story = {
  render: () => <DiaperTrackerWrapper initialDiapers={mockDiaperLogs.filter(log => log.diaperType === 'dirty')} />,
};

export const BothTypes: Story = {
  render: () => <DiaperTrackerWrapper initialDiapers={mockDiaperLogs.filter(log => log.diaperType === 'both')} />,
};

export const WithNotes: Story = {
  render: () => <DiaperTrackerWrapper initialDiapers={mockDiaperLogs.filter(log => log.notes && log.notes.length > 0)} />,
};

export const MultipleDays: Story = {
  render: () => <DiaperTrackerWrapper initialDiapers={[...mockDiaperLogs, yesterdayLog]} />,
};

export const ConcerningPattern: Story = {
  render: () => <DiaperTrackerWrapper initialDiapers={[
    {
      id: 7,
      userId: 1,
      diaperType: 'dirty',
      occurredAt: new Date().toISOString(),
      color: 'green',
      consistency: 'watery',
      notes: 'Very watery green stool - 3rd time today',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 8,
      userId: 1,
      diaperType: 'dirty',
      occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      color: 'green',
      consistency: 'watery',
      notes: 'Watery stool continues',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]} />,
};

export const NewbornStools: Story = {
  render: () => <DiaperTrackerWrapper initialDiapers={[
    {
      id: 9,
      userId: 1,
      diaperType: 'dirty',
      occurredAt: new Date().toISOString(),
      color: 'black',
      consistency: 'pasty',
      notes: 'Meconium - normal for day 1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 10,
      userId: 1,
      diaperType: 'wet',
      occurredAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      notes: 'First wet diaper',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]} />,
};

export const ExtensiveTracking: Story = {
  render: () => <DiaperTrackerWrapper initialDiapers={[
    ...mockDiaperLogs,
    {
      id: 11,
      userId: 1,
      diaperType: 'wet',
      occurredAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      notes: 'Morning diaper',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 12,
      userId: 1,
      diaperType: 'both',
      occurredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      color: 'yellow',
      consistency: 'seedy',
      notes: 'After feeding',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]} />,
};
