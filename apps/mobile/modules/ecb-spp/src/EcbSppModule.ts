import { NativeModule, requireNativeModule } from 'expo';

declare class EcbSppModule extends NativeModule<{}> {}

export default requireNativeModule<EcbSppModule>('EcbSpp');
