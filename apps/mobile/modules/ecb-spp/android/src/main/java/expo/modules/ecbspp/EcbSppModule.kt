package expo.modules.ecbspp

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class EcbSppModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("EcbSpp")

    AsyncFunction("isAvailable") {
      false
    }
  }
}
