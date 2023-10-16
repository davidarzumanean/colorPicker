# Color Picker

This project is a color picker tool that allows you to pick colors from an image using a magnifier and save them to your clipboard. The canvas is initially limited to the screen width but can be extended to a custom canvas size. You can also adjust the magnifier's zoom level before and after activating the color dropper.

## Usage

To run the project, compile the TypeScript code and open `index.html`:

   ```shell
   npm run start
   ```
   
You can also access the deployed version on [GitHub Pages](https://davidarzumanean.github.io/colorPicker/)


# Features
- Canvas Size Extension: Click the `expand`/`collapse` button to increase/decrease the canvas size.
- Zoom Control: Adjust the magnifier's zoom level using the dropdown menu.


### Keyboard Shortcuts:

- `Cmd/Ctrl` + `+`: Zoom in.
- `Cmd/Ctrl` + `-`: Zoom out.
- `Double-Click`: Show the magnifier.
- `Escape`: Hide the magnifier.
- `Click` (with the magnifier active): Pick a color and save it to your clipboard.