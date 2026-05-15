import { useStockStore } from './store/useStockStore';
import { UploadScreen } from './components/UploadScreen';
import { EditorScreen } from './components/EditorScreen';
import { ExportSuccessScreen } from './components/ExportSuccessScreen';
import { ColorGalleryScreen } from './components/ColorGalleryScreen';

export function App() {
  const loaded = useStockStore((s) => s.loaded);
  const currentScreen = useStockStore((s) => s.currentScreen);

  if (!loaded) return <UploadScreen />;
  if (currentScreen === 'export_success') return <ExportSuccessScreen />;
  if (currentScreen === 'colors') return <ColorGalleryScreen />;
  return <EditorScreen />;
}
