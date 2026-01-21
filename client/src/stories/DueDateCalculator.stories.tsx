import React, { useState, useEffect } from 'react';
import DueDateCalculator from '../components/tools/pregnant/DueDateCalculator';
import { bbtoolsService, DueDateLog } from '../services/BBToolsService';
import { authService } from '../services/authService';

type Meta<T> = {
  title: string;
  component: T;
  parameters?: any;
  tags?: string[];
  decorators?: any[];
};

type StoryObj<T> = {
  render?: (args: any) => React.ReactElement;
};

const DueDateCalculatorWrapper = ({ initialData }: { initialData?: DueDateLog | null }) => {
  const [mockData, setMockData] = useState<DueDateLog | null>(initialData || null);
  
  useEffect(() => {
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    
    Storage.prototype.getItem = (key: string) => {
      if (key === 'dueDateCalculatorData' && mockData) {
        return JSON.stringify({
          lastPeriod: mockData.lmpDate.slice(0, 10),
          dueDate: new Date(new Date(mockData.lmpDate).getTime() + 280 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          weeksPregnant: mockData.weeksPregnant
        });
      }
      return originalGetItem.call(localStorage, key);
    };
    
    Storage.prototype.setItem = (key: string, value: string) => {
      console.log('Mock: localStorage.setItem', key, value);
      if (key === 'dueDateCalculatorData') {
        const data = JSON.parse(value);
        const lmpDate = new Date(data.lastPeriod).toISOString();
        setMockData({
          lmpDate,
          weeksPregnant: data.weeksPregnant
        });
      }
      return originalSetItem.call(localStorage, key, value);
    };
    
    const originalGetToken = authService.getToken;
    authService.getToken = () => mockData ? 'mock-token' : null;
    
    const originalGetDueDate = bbtoolsService.getDueDate;
    const originalSaveDueDate = bbtoolsService.saveDueDate;
    
    bbtoolsService.getDueDate = async () => {
      console.log('Mock: Getting due date', mockData);
      if (mockData) {
        return { success: true, data: mockData };
      }
      return { success: false, data: null };
    };
    
    bbtoolsService.saveDueDate = async (data: Partial<DueDateLog>) => {
      console.log('Mock: Saving due date', data);
      const newData: DueDateLog = {
        id: mockData?.id || 1,
        lmpDate: data.lmpDate || '',
        weeksPregnant: data.weeksPregnant || 0
      };
      setMockData(newData);
      return { success: true, data: newData };
    };
    
    return () => {
      Storage.prototype.getItem = originalGetItem;
      Storage.prototype.setItem = originalSetItem;
      authService.getToken = originalGetToken;
      bbtoolsService.getDueDate = originalGetDueDate;
      bbtoolsService.saveDueDate = originalSaveDueDate;
    };
  }, []);
  
  return <DueDateCalculator />;
};

const meta: Meta<typeof DueDateCalculator> = {
  title: 'Tools/Pregnant/DueDateCalculator',
  component: DueDateCalculator,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A due date calculator that helps pregnant mothers estimate their delivery date based on the first day of their last menstrual period (LMP). Shows current progress, trimester, and pregnancy milestones.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DueDateCalculatorWrapper>;

export const Empty: Story = {
  render: () => <DueDateCalculatorWrapper initialData={null} />,
};

export const FirstTrimester: Story = {
  render: () => {
    const lmpDate = new Date();
    lmpDate.setDate(lmpDate.getDate() - (8 * 7));
    return <DueDateCalculatorWrapper 
      initialData={{
        id: 1,
        lmpDate: lmpDate.toISOString(),
        weeksPregnant: 8
      }} 
    />;
  },
};

export const SecondTrimester: Story = {
  render: () => {
    const lmpDate = new Date();
    lmpDate.setDate(lmpDate.getDate() - (20 * 7));
    return <DueDateCalculatorWrapper 
      initialData={{
        id: 1,
        lmpDate: lmpDate.toISOString(),
        weeksPregnant: 20
      }} 
    />;
  },
};

export const ThirdTrimester: Story = {
  render: () => {
    const lmpDate = new Date();
    lmpDate.setDate(lmpDate.getDate() - (30 * 7));
    return <DueDateCalculatorWrapper 
      initialData={{
        id: 1,
        lmpDate: lmpDate.toISOString(),
        weeksPregnant: 30
      }} 
    />;
  },
};

export const FullTerm: Story = {
  render: () => {
    const lmpDate = new Date();
    lmpDate.setDate(lmpDate.getDate() - (37 * 7));
    return <DueDateCalculatorWrapper 
      initialData={{
        id: 1,
        lmpDate: lmpDate.toISOString(),
        weeksPregnant: 37
      }} 
    />;
  },
};

export const VeryEarly: Story = {
  render: () => {
    const lmpDate = new Date();
    lmpDate.setDate(lmpDate.getDate() - (4 * 7));
    return <DueDateCalculatorWrapper 
      initialData={{
        id: 1,
        lmpDate: lmpDate.toISOString(),
        weeksPregnant: 4
      }} 
    />;
  },
};

export const EndOfFirstTrimester: Story = {
  render: () => {
    const lmpDate = new Date();
    lmpDate.setDate(lmpDate.getDate() - (12 * 7));
    return <DueDateCalculatorWrapper 
      initialData={{
        id: 1,
        lmpDate: lmpDate.toISOString(),
        weeksPregnant: 12
      }} 
    />;
  },
};

export const StartOfThirdTrimester: Story = {
  render: () => {
    const lmpDate = new Date();
    lmpDate.setDate(lmpDate.getDate() - (28 * 7));
    return <DueDateCalculatorWrapper 
      initialData={{
        id: 1,
        lmpDate: lmpDate.toISOString(),
        weeksPregnant: 28
      }} 
    />;
  },
};

export const AlmostDue: Story = {
  render: () => {
    const lmpDate = new Date();
    lmpDate.setDate(lmpDate.getDate() - (39 * 7));
    return <DueDateCalculatorWrapper 
      initialData={{
        id: 1,
        lmpDate: lmpDate.toISOString(),
        weeksPregnant: 39
      }} 
    />;
  },
};

export const MidFirstTrimester: Story = {
  render: () => {
    const lmpDate = new Date();
    lmpDate.setDate(lmpDate.getDate() - (10 * 7));
    return <DueDateCalculatorWrapper 
      initialData={{
        id: 1,
        lmpDate: lmpDate.toISOString(),
        weeksPregnant: 10
      }} 
    />;
  },
};

export const MidSecondTrimester: Story = {
  render: () => {
    const lmpDate = new Date();
    lmpDate.setDate(lmpDate.getDate() - (24 * 7));
    return <DueDateCalculatorWrapper 
      initialData={{
        id: 1,
        lmpDate: lmpDate.toISOString(),
        weeksPregnant: 24
      }} 
    />;
  },
};
