interface ElementData {
  id: string;
  images: string[];
  prompt: string;
  size: {
    ratio: string;
    resolution: string;
  };
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
  loras: Array<{
    name: string;
    link: string;
    weight: string;
  }>;
}
