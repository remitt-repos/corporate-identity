/**
 * @format
 * Copyright (C) Xorde Technologies
 * All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Xander Tovski, 2019-*
 **/

import * as sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { Sharp } from 'sharp';
import { TConfig, TVariantConfig } from './types/config';
import { Manifest } from './classes/manifest';
import { Collection } from './classes/collection.class';

const SRC_PATH = 'src';
const SRC_JSON = 'src.json';
const DEFAULT_OUTPUT = 'build';
const DEFAULT_INDEX = 'index.md';

type TResizeResult = {
	file: string;
	fullPath: string;
	size: number;
}

class Builder {
	private readonly buildJson: TConfig;
	private collection: Collection = new Collection();

	constructor() {
		// Load src.json
		this.buildJson = JSON.parse(fs.readFileSync(path.join(SRC_PATH, SRC_JSON)).toString());
		this.buildJson.output = this.buildJson.output ?? DEFAULT_OUTPUT;
		this.buildJson.index = this.buildJson.index ?? DEFAULT_INDEX;

		// Create build directory
		fs.mkdirSync(this.buildJson.output, { recursive: true });
	}

	/**
	 * Launches the build process
	 */
	build() {
		// Iterate over variants
		const variants = this.buildJson.variants;
		Object.keys(variants).forEach(async (variant) => {
			const variantConfig: TVariantConfig = variants[variant];
			const outputPath = path.join(this.buildJson.output, path.dirname(variant));
			const outputFile = path.basename(variant);
			const outputFullPath = path.join(outputPath, outputFile);
			const inputPath = path.join(SRC_PATH, variantConfig.src);

			const image: Sharp = sharp(inputPath);

			console.log(`Building ${outputFullPath}...`);
			const manifest = new Manifest(variantConfig.manifest?.options);

			if (variantConfig.resize) {
				for (const format of variantConfig.save) {
					for (const size of variantConfig.resize) {
						if (variantConfig.flatten) image.flatten({ background: variantConfig.flatten });
						if (variantConfig.metadata) image.withMetadata(variantConfig.metadata);

						const result = await this.resize(image, outputFullPath, format, size, variantConfig.quality);

						const relativePath = path.relative(this.buildJson.output, result.fullPath);
						this.collection.addImage({
							file: relativePath,
							size: result.size.toString(),
							variant, format,
							description: `Dimension: ${size}, Format: ${format}`
						});
						manifest?.addIcon({ src: result.file, type: format, sizes: size });
						console.log(`Built ${format} ${size} ${result.size} bytes`);
					}
				}
			} else console.log('No conversion needed');

			if (variantConfig.manifest?.file) {
				manifest.write(path.join(outputPath, variantConfig.manifest.file));
				console.log(`Built manifest ${variantConfig.manifest.file}`);
			}
			const collection = this.collection.getMarkdown();
			fs.writeFileSync(path.join(this.buildJson.output, this.buildJson.index), collection);
		})
	}

	/**
	 * Resizes an image passed as Sharp object
	 * @param image Sharp object
	 * @param output Base output path
	 * @param format Output format
	 * @param size Output size as "w x h" string
	 * @param quality Output quality (0-100)
	 * @return {Promise<TResizeResult>} Information about the resized image
	 */
	async resize(image: Sharp, output: string, format: string, size: string, quality = 80): Promise<TResizeResult> {
		// Check if format is supported
		if (!["png", "jpeg"].includes(format)) {
			console.error(`Format ${format} is not supported`);
			return undefined;
		}

		const metadata = await image.metadata();
		const { width, height } = this.parseSize(size, metadata.height, metadata.width);

		const outputFullPath = `${output}-${width}x${height}.${format}`;

		// Set output quality (~~ converts float to int)
		const outputQuality = format === "png" ? ~~(quality / 10) : quality;

		// Call sharp with dynamic function name (format)
		image.resize(width, height)[format]({ quality: outputQuality });

		// Create output directory
		fs.mkdirSync(path.dirname(output), { recursive: true });

		const result = await image.toFile(outputFullPath);
		return { file: path.basename(outputFullPath), fullPath: outputFullPath, size: result.size };
	}

	/**
	 * Parses a size string into width and height
	 * @param size Size string (w x h), with "auto" as a special case
	 * @param imageHeight
	 * @param imageWidth
	 * @private
	 */
	private parseSize(size: string, imageHeight: number = 100, imageWidth: number = 100) {
		let [width, height] = size.toLowerCase().split("x");
		width = width.trim();
		height = height.trim();
		const aspectRatio = imageWidth / imageHeight;
		const auto = ["auto", "0"];

		if (auto.includes(width) && auto.includes(height)) return { width: imageWidth, height: imageHeight }
		else if (auto.includes(width)) {
			width = Math.round(parseInt(height) * aspectRatio).toString();
		}
		else if (auto.includes(height)) {
			height = Math.round(parseInt(width) / aspectRatio).toString();
		}

		return { width: parseInt(width), height: parseInt(height) };
	}
}

new Builder().build();
