// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2026 ScriptX
//
// Adopts the UIKit scene life cycle on iOS and tvOS. An app built with the
// iOS 27 SDK and launched on iOS 27 or later is refused unless it uses scenes:
//
//   Application failed to launch: UIScene life cycle is required for apps
//   built with this SDK.
//
// The Expo SDK 56 / react-native-tvos AppDelegate template still creates its
// window in application(_:didFinishLaunchingWithOptions:). This plugin:
//   1. declares a single-window scene manifest in Info.plist, and
//   2. moves window creation and startReactNative into a SceneDelegate. The
//      AppDelegate keeps building the React Native factory at launch.
// Older iOS versions run the same scene path, so one build works everywhere.

const { withAppDelegate, withInfoPlist } = require('@expo/config-plugins');

const MARKER = '// EVERFRAME_SCENE_LIFECYCLE: injected by ./plugins/with-scene-lifecycle.js';

// The template's window bootstrap, which the SceneDelegate takes over.
const WINDOW_BOOTSTRAP =
  /window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\(\s*withModuleName: "main",\s*in: window,\s*launchOptions: launchOptions\)/;

const SCENE_DELEGATE = `
${MARKER}
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else { return }
    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window
    // A cold-start deep link arrives on the scene, not in launchOptions;
    // hand it to React Native where Linking.getInitialURL() looks for it.
    var launchOptions = appDelegate.launchOptions ?? [:]
    if let url = connectionOptions.urlContexts.first?.url {
      launchOptions[.url] = url
    }
    factory.startReactNative(withModuleName: "main", in: window, launchOptions: launchOptions)
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      _ = RCTLinkingManager.application(UIApplication.shared, open: context.url, options: [:])
    }
  }
}
`;

function withSceneManifest(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });
}

function withSceneDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error('with-scene-lifecycle: expected a Swift AppDelegate');
    }
    let src = cfg.modResults.contents;
    if (src.includes(MARKER)) return cfg;
    if (!WINDOW_BOOTSTRAP.test(src)) {
      // Fail the prebuild loudly rather than ship an app that cannot launch
      // on iOS 27: the template changed and this plugin needs updating.
      throw new Error('with-scene-lifecycle: AppDelegate window bootstrap not found');
    }
    src = src.replace(WINDOW_BOOTSTRAP, '// The SceneDelegate creates the window and starts React Native.\n    self.launchOptions = launchOptions');
    src = src.replace(
      /(var reactNativeFactory: RCTReactNativeFactory\?\n)/,
      '$1  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?\n',
    );
    cfg.modResults.contents = `${src.trimEnd()}\n${SCENE_DELEGATE}`;
    return cfg;
  });
}

module.exports = function withSceneLifecycle(config) {
  return withSceneDelegate(withSceneManifest(config));
};
