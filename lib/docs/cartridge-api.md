# Cartridge API

- [Options](#user-content-options)
- [Methods](#user-content-methods)

## Options

## Methods

#### .downloadCartridge(url)

Downloads and executes ROM image from the specified URL. The URL should be from the same domain as the web application using CFxNES or the target server needs to support [CORS](https://www.w3.org/TR/cors/).

- **url**: `string` - URL of the ROM image
- **returns**: `Promise`
