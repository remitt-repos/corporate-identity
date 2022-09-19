import { TFormat } from './formats';
import { WriteableMetadata } from 'sharp';
import { TManifest } from './manifest';

export type TVariantManifest = {
	file: string;
	options: TManifest;
}

export type TVariantConfig = {
	src: string;
	resize: string[];
	save: TFormat[];
	quality?: number;
	flatten?: string;
	manifest?: TVariantManifest;
	metadata?: WriteableMetadata;
}

export type TVariantConfigs = {
	[variant: string]: TVariantConfig;
}

export type TConfig = {
	output: string;
	index: string;
	variants: TVariantConfigs;
}
