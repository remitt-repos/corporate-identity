/**
 * A collection is a markdown file that contains a list of built images.
 */

type TImage = {
	file: string;
	variant: string;
	description: string;
	format: string;
	size: string;
}

export class Collection {
	private images: TImage[] = [];
	private variants: string[] = [];

	addImage(image: TImage): void {
		this.images.push(image);
		if (!this.variants.includes(image.variant)) this.variants.push(image.variant);
	}

	getMarkdown(): string {
		let markdown = `# Collection`;
		markdown += `\nThis automatically generated collection contains ${this.images.length} images.\n`;

		this.variants.forEach((variant) => {
			markdown += `\n\n## ${variant}\n`;

			this.images.filter((image) => image.variant == variant).forEach((image) => {
				markdown += `**${image.description}**:\n\n![${image.description}](${image.file})\n\n`;
			});
		});

		return markdown;
	}
}
