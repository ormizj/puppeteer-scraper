interface ElementData {
  id: string;
  prompt: string;
  negative: string;
  method: string;
  steps: string;
  cfg: string;
  seed: string;
  vae: string;
  model: {
    name: string;
    link: string;
  };
  images: string[];
  size: {
    ratio: string;
    resolution: string;
  };
  loras: Array<{
    name: string;
    link: string;
    weight: string;
  }>;
}
