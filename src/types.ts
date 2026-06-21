export type ChoreKey = 'brushing' | 'mopping' | 'dusting' | 'vacuuming';

export interface Chore {
  key: ChoreKey;
  title: string;
  description: string;
  longDescription: string;
  iconName: string; // The lucide icon name to render dynamically
  detailedSteps: string[];
}

export interface Brother {
  id: string; // unique identifier
  index: number; // 0, 1, 2, 3 corresponding to original slots
  name: string;
}

export interface Assignment {
  choreKey: ChoreKey;
  brotherIndex: number;
  brotherName: string;
  isCombined?: boolean;
}

export interface WeekendChecklist {
  [choreKey: string]: {
    completed: boolean;
    completedAt?: string;
  };
}
