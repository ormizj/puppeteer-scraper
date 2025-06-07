export default class Formatter {
  readonly #data: ElementData;

  constructor(data: ElementData) {
    this.#data = data;
  }

  json(): string {
    const metadata = {
      prompt: this.#data.prompt,
      negative: this.#data.negative,
      model: this.#data.model,
      loras: this.#data.loras,
      method: this.#data.method,
      steps: this.#data.steps,
      cfg: this.#data.cfg,
      seed: this.#data.seed,
      vae: this.#data.vae,
      size: this.#data.size,
    };

    return JSON.stringify(metadata, null, 2);
  }

  txt(): string {
    const repeats = 100;
    const decorator = "=".repeat(repeats);
    const separator = "-".repeat(repeats / 2);
    const spacer = "\n\n";
    const lines: string[] = [];
    const insertSubTitle = (title: string) => {
      lines.push(separator);
      lines.push(title);
      lines.push(separator);
    };

    // header
    lines.push(decorator);
    lines.push("METADATA INFORMATION");
    lines.push(decorator);
    lines.push(spacer);

    // prompt
    insertSubTitle("PROMPT INFORMATION");
    lines.push(`Prompt:`);
    lines.push(this.#data.prompt);
    lines.push("");

    lines.push(`Negative:`);
    lines.push(this.#data.negative);
    lines.push(spacer);

    // model
    insertSubTitle("MODEL INFORMATION");
    lines.push(`Name: ${this.#data.model.name}`);
    lines.push(`Link: ${this.#data.model.link}`);
    lines.push(spacer);

    // lora
    insertSubTitle("LORA INFORMATION");
    this.#data.loras.forEach((lora, index) => {
      lines.push(`LoRA ${index + 1}:`);
      lines.push(`  Name: ${lora.name}`);
      lines.push(`  Weight: ${lora.weight}`);
      lines.push(`  Link: ${lora.link}`);
      lines.push("");
    });
    lines.pop();
    lines.push(spacer);

    // generation
    insertSubTitle("GENERATION SETTINGS");
    lines.push(`Method: ${this.#data.method}`);
    lines.push(`Steps: ${this.#data.steps}`);
    lines.push(`CFG Scale: ${this.#data.cfg}`);
    lines.push(`Seed: ${this.#data.seed}`);
    lines.push(`VAE: ${this.#data.vae}`);
    lines.push(spacer);

    // size
    insertSubTitle("SIZE INFORMATION");
    lines.push(`Ratio: ${this.#data.size.ratio}`);
    lines.push(`Resolution: ${this.#data.size.resolution}`);
    lines.push("");

    lines.push(decorator);
    return lines.join("\n");
  }
}
