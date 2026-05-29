import { registerWebModule, NativeModule } from 'expo';

// EcbSppModule is not available on the web platform.
class EcbSppModule extends NativeModule<{}> {}

export default registerWebModule(EcbSppModule, 'EcbSppModule');
