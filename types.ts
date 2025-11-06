
export interface Scene {
  scene: number;
  description: string;
  isGenerating?: boolean;
  imageUrl?: string;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
