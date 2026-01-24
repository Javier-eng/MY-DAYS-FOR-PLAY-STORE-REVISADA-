export enum CategoryType {
  BIRTHDAYS = 'BIRTHDAYS',
  DOCUMENTS = 'DOCUMENTS',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  APPOINTMENTS = 'APPOINTMENTS',
  NOTES = 'NOTES',
  VIOLET = 'VIOLET'
}

export type SubCategoryType = 
  | 'DNI_PASAPORTE' | 'BANCO_TARJETAS' | 'VEHICULOS' | 'SEGUROS'
  | 'TELEFONIA' | 'WEB_APP' | 'TV_WIFI' | 'TIENDAS_CLUBS'
  | 'MEDICAS' | 'TRABAJO' | 'AMIGOS' | 'FAMILIARES'
  | 'OTRO';

export type ExpenseCategory = 
  | 'SUPERMARKET' | 'RESTAURANT' | 'SHOPPING' | 'WORK' | 'ENTERTAINMENT' | 'TRANSPORT' | 'HOME' 
  | 'PETS' | 'FUEL' | 'VEHICLES' | 'SERVICES' | 'HEALTH' | 'OTHERS';

export type LanguageCode = 'en' | 'es';

export type TimeUnit = 'minutes' | 'hours' | 'days';

export interface CategorySettings {
  daysBefore: number;
  timeUnit?: TimeUnit;
  notificationTime?: string;
}

export interface ReminderSettings {
  categoryConfigs: Record<CategoryType, CategorySettings>;
  reminderMethod: 'audio' | 'mail' | 'push';
  repetitionCount: number;
  autoDeleteExpired: boolean;
  defaultNotificationTime: string;
}

export interface UserProfile {
  name: string;
  email: string;
  subscription: 'free' | 'annual' | 'lifetime';
  dateOfBirth?: string;
  purchaseDate?: string;
  currency: string;
  profileImage?: string;
  showProfileImage: boolean;
  wallpaper?: string;
  wallpaperOpacity: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  time: string;
  note?: string;
  fileData?: string; // Base64 encoded file
  fileName?: string;
}

export interface ReminderDate {
  id: string;
  title: string;
  date: string;
  time?: string;
  category: CategoryType;
  subCategory: SubCategoryType;
  reminderFrequency: 'daily' | 'weekly' | 'monthly' | 'one-time';
  notifyDaysBefore: number[];
  notes?: string;
  audioData?: string; // Base64 encoded audio
  fileData?: string; // Base64 encoded file
  fileName?: string;
  isPremium?: boolean;
  repeatYearly?: boolean;
  snoozeTime?: string;
  noteColor?: CategoryType;
}

export interface AppState {
  dates: ReminderDate[];
  expenses: Expense[];
  language: LanguageCode;
  isPro: boolean;
  theme: 'light' | 'dark';
  globalSettings: ReminderSettings;
  user: UserProfile;
}

export type View = 'dashboard' | 'categories' | 'sub-categories' | 'calendar' | 'settings' | 'category-detail';