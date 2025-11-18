
import type { GeneratedImage } from './types';

export const IMAGE_GENERATION_CONFIGS: Omit<GeneratedImage, 'src' | 'isLoading'>[] = [
  { id: 'past-20', title: '20 Years Ago', prompt: "Make the person in this photo look 20 years younger. Emphasize youthful features like smoother skin, fewer lines, and natural hair color from that age. The result must be photorealistic and clearly recognizable as the same person." },
  { id: 'past-10', title: '10 Years Ago', prompt: "Make the person in this photo look 10 years younger. Focus on reducing fine lines and adding a touch of youthful vibrancy. Maintain a photorealistic style and the person's core identity." },
  { id: 'past-5', title: '5 Years Ago', prompt: 'Make the person in this photo look 5 years younger. This should be a subtle change, slightly softening any recent signs of aging. The result must be photorealistic.' },
  { id: 'avatar', title: 'Animated Avatar', prompt: 'Create a smiling, friendly, animated-style avatar based on the person in this photo. The style should be clean and modern, like a 3D animation character.' },
  { id: 'future-5', title: '5 Years From Now', prompt: 'Make the person in this photo look 5 years older. Introduce subtle signs of aging like fine lines around the eyes. The result must be photorealistic and believable.' },
  { id: 'future-10', title: '10 Years From Now', prompt: "Make the person in this photo look 10 years older. Add natural aging signs like more noticeable wrinkles, perhaps some graying at the temples, and a slight change in skin texture. Keep it photorealistic and true to their identity." },
  { id: 'future-20', title: '20 Years From Now', prompt: "Make the person in this photo look 20 years older. Show more significant signs of aging like deeper wrinkles, more prominent age spots, visible graying hair, and slightly less skin elasticity. The result must be a realistic and respectful portrait of aging." },
];
