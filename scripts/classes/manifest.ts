import { TManifest, TManifestIcon } from '../types/manifest';
import * as fs from "fs";

export class Manifest {
	data: TManifest;

	constructor(data?: TManifest) {
		this.data = data ?? {};
		if (!Array.isArray(this.data.icons)) this.data.icons = [];
		if (!this.data.name) this.data.name = process.env.npm_package_name;
	}

	addIcon(icon: TManifestIcon) {
		if (icon.type == 'png') icon.type = 'image/png';
		if (icon.type == 'jpeg') icon.type = 'image/jpeg';
		if (icon.type == 'ico') icon.type = 'image/x-icon'; // Reserved for future use
		this.data.icons.push(icon);
	}

	write(file: string) {
		fs.writeFileSync(file, JSON.stringify(this.data, null, 2));
	}
}
