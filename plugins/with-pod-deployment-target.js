// Xcode 27 refuses pods whose deployment target is below 15.0 (for example
// react-native-svg's RNSVGFilters subspec, still at 12.4). Raise every pod to
// the app's own minimum in the Podfile's post_install hook.
const fs = require('node:fs');
const path = require('node:path');
const { withDangerousMod } = require('@expo/config-plugins');

const MIN = '16.4';
const MARKER = '# NOCTURNE_POD_DEPLOYMENT_TARGET';

module.exports = function withPodDeploymentTarget(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      const src = fs.readFileSync(podfile, 'utf8');
      if (src.includes(MARKER)) return cfg;
      const hook = /post_install do \|installer\|\n/;
      if (!hook.test(src)) throw new Error('[with-pod-deployment-target] no post_install hook in Podfile');
      const block = [
        `    ${MARKER}`,
        '    installer.pods_project.targets.each do |t|',
        '      t.build_configurations.each do |c|',
        "        %w[IPHONEOS_DEPLOYMENT_TARGET TVOS_DEPLOYMENT_TARGET].each do |key|",
        `          c.build_settings[key] = '${MIN}' if c.build_settings[key] && c.build_settings[key].to_f < ${MIN}`,
        '        end',
        '      end',
        '    end',
        '',
      ].join('\n');
      fs.writeFileSync(podfile, src.replace(hook, (m) => `${m}${block}`), 'utf8');
      return cfg;
    },
  ]);
};
