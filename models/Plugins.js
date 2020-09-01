const { readdirSync, readFileSync } = require('fs');

const Plugin = require('./Plugin');

class Plugins extends Map {
  load() {
    this.clear();
    const contextVars = {};
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
            logger.error(`Cannot read ${manifest.sourceFile}. Skipping installing plugin '${pluginName}'`);
          }
        }

        let plugin = new Plugin(pluginName, manifest.parameters, code);
        this.set(pluginName, plugin);
        contextVars[pluginName] = plugin;
      } catch (error) {
        logger.error(`${error.message}. Skipping processing plugin directory '${dir.name}'.`);
      }
    }

    return contextVars;
  }
}

module.exports = Plugins;
