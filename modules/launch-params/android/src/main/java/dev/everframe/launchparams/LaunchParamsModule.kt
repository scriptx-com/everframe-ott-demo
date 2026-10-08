package dev.everframe.launchparams

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// VibeView delivers params as intent extras on the launched activity AND as
// shared preferences named "prefs.db"; Android TV release builds get extras
// only (vibeview docs: launch-params.md). Never use a typed getter: a value
// stored as a non-string would throw on getString.
class LaunchParamsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LaunchParams")
    Function("get") { key: String ->
      // Bundle.get(key) is deprecated in favour of typed getters, which is
      // exactly what must be avoided here (see above).
      @Suppress("DEPRECATION")
      val fromIntent = appContext.currentActivity?.intent?.extras?.get(key)?.toString()
      val fromPrefs = appContext.reactContext
        ?.getSharedPreferences("prefs.db", Context.MODE_PRIVATE)
        ?.all?.get(key)?.toString()
      (fromIntent ?: fromPrefs)?.takeIf { it.isNotEmpty() }
    }
  }
}
