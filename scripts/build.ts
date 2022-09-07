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

const BUILD_PATH = "build";
const SRC_PATH = "src";
const SRC_JSON = "src.json";

type TResizeResult = {
	file: string;
	fullpath: string;
	size: number;
}

class Builder {
	private buildJson: TConfig;

	constructor() {
		// Load build.json
		this.buildJson = JSON.parse(fs.readFileSync(path.join(SRC_PATH, SRC_JSON)).toString());
		// Create build directory
		fs.mkdirSync(BUILD_PATH, { recursive: true });
	}

	build() {
		// Iterate over variants
		Object.keys(this.buildJson).forEach(async (variant) => {
			const variantConfig: TVariantConfig = this.buildJson[variant];
			const outputPath = path.join(BUILD_PATH, path.dirname(variant));
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
						manifest?.addIcon({ src: result.file, type: format, sizes: size });
						console.log(`Built ${format} ${size} ${result.size} bytes`);
					}
				}
			} else console.log('No conversion needed');

			if (variantConfig.manifest?.file) {
				manifest.write(path.join(outputPath, variantConfig.manifest.file));
				console.log(`Built manifest ${variantConfig.manifest.file}`);
			}
		})
	}

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
		return { file: path.basename(outputFullPath), fullpath: outputFullPath, size: result.size };
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
