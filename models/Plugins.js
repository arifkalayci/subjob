const { readdirSync, readFileSync } = require('fs');

const Plugin = require('./Plugin');

class Plugins extends Map {
  constructor(context) {
    super();
    this.context = context;
  }

  load() {
    this.clear();

    let pluginDirs = readdirSync('plugins', { withFileTypes: true }).filter(dirent => dirent.isDirectory());

    for (let dir of pluginDirs) {
      try {
        let manifest = JSON.parse(readFileSync(`plugins/${dir.name}/manifest.json`, 'utf-8'));

        let pluginName = manifest.name || dir.name;

        let code;
        if (manifest.source !== undefined) {
          code = manifest.source;
        } else {
          try {
            code = readFileSync(`plugins/${dir.name}/${manifest.sourceFile}`, 'utf-8');
          } catch(error) {
            console.info(`Cannot read ${manifest.sourceFile}. Skipping installing plugin '${pluginName}'`);
          }
        }

        let plugin = new Plugin(manifest.parameters, code);
        this.context[pluginName] = plugin;
        this.set(pluginName, plugin);
      } catch (error) {
        console.info(`Error: ${error.message}. Skipping processing plugin directory '${dir.name}'.`);
      }
    }

    this.context['plugins'] = this;
  }
}

module.exports = Plugins;
