
import type { GeneratedImage } from './types';

export const IMAGE_GENERATION_CONFIGS: Omit<GeneratedImage, 'src' | 'isLoading'>[] = [
  { id: 'past-20', title: '20 Years Ago', prompt: 'Make the person in this photo look 20 years younger, possibly a child or teenager depending on current age. Maintain a photorealistic style, consistent lighting, and high facial detail.' },
  { id: 'past-10', title: '10 Years Ago', prompt: 'Make the person in this photo look 10 years younger. Maintain a photorealistic style.' },
  { id: 'past-5', title: '5 Years Ago', prompt: 'Make the person in this photo look 5 years younger. Maintain a photorealistic style.' },
  { id: 'avatar', title: 'Animated Avatar', prompt: 'Create a smiling, friendly, animated-style avatar based on the person in this photo. The style should be clean and modern, like a 3D animation character.' },
  { id: 'future-5', title: '5 Years From Now', prompt: 'Make the person in this photo look 5 years older. Show natural signs of aging. Maintain a photorealistic style.' },
  { id: 'future-10', title: '10 Years From Now', prompt: 'Make the person in this photo look 10 years older. Show natural signs of aging. Maintain a photorealistic style.' },
  { id: 'future-20', title: '20 Years From Now', prompt: 'Make the person in this photo look 20 years older. Show significant but natural signs of aging, wrinkles, and grey hair if applicable. Maintain a photorealistic style.' },
];
