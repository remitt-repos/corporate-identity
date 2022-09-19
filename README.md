# Remitt Project Corporate Identity

Source code base for https://identity.remitt.foundation/

Remitt Identity Kit is a collection of assets and guidelines for the Remitt Project.

The project includes a builder script system that allows you to generate a customised version of the Remitt Identity Kit for your project.

## Source Definition Schema `src.json`

```json
{
    "<variant_name>": {
        "src": "<path_to_source_file>",
        "resize": ["<size>"],
        "save": ["<save_format>"],
        "flatten": "<#flatten_color_hex>",
        "manifest": {
            "file": "<manifest_file>",
            "options": {
                "key": "value"
            }
        },
        "metadata": {
            "key": "value"
        }
    }
}
```

Available options:
- **variant_name**: The name of the variant. This is used to generate the output file name.
- **path_to_source_file**: The path to the source file. This can be a relative path or an absolute path.
- **size**: The size of the output file. This can be a single size or an array of sizes.
- **save_format**: The format of the output file. This can be a single format or an array of formats.
- **flatten_color_hex**: The color to flatten the image with. This is used to remove transparency from the image.
- **manifest_file**: The filename of the manifest file to generate. File will be generated in the variant directory.

### Example

```json
{
	"icons": {
		"src": "icon.svg",
		"resize": [
			"16x16",
			"32x32",
			"64x64",
			"128x128",
			"256x256"
		],
		"metadata": {
			"Copyright": "Remitt Foundation"
		},
        "flatten": "#ffffff",
		"save": [
			"jpeg",
			"png"
		]
	},
	"icons_ios": {
		"src": "icon.svg",
		"resize": [
			"120x120",
			"152x152",
			"167x167",
			"180x180",
			"1024x1024"
		],
		"save": [
			"png"
		]
	},
	"favicons": {
		"src": "icon.svg",
		"resize": [
			"16x16",
			"32x32",
			"144x144",
			"152x152"
		],
		"save": [
			"png"
		],
		"manifest": {
			"file": "manifest.json",
            "options": {
                "name": "Manifest name"
            }
		}
	}
}
```

## Building

To build the Remitt Identity Kit, run the following command:

```bash
yarn build
```

To clean the build directory, run the following command:

```bash
yarn clean
```

## Static site generation

To generate the static site, run the following command:

```bash
yarn vite:build
```
