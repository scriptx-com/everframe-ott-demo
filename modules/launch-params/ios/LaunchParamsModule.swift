import ExpoModulesCore

// VibeView writes launch params into the app's standard user defaults before
// launch (vibeview docs: launch-params.md, "iOS"). tvOS uses the same store.
public class LaunchParamsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LaunchParams")
    Function("get") { (key: String) -> String? in
      guard let value = UserDefaults.standard.object(forKey: key) else { return nil }
      let text = "\(value)"
      return text.isEmpty ? nil : text
    }
  }
}
