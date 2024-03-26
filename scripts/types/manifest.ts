export type TManifestIcon = {
	src: string;
	sizes: string;
	type: string;
};

export type TManifest = {
	shortname?: string;
	name?: string;
	display?: string;
	theme_color?: string;
	background_color?: string;
	start_url?: string;
	icons?: TManifestIcon[];
};
