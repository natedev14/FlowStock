import { useStockStore } from './store/useStockStore';
import { UploadScreen } from './components/UploadScreen';
import { ExportSuccessScreen } from './components/ExportSuccessScreen';
import { ColorGalleryScreen } from './components/ColorGalleryScreen';
import { ColorCountScreen } from './components/ColorCountScreen';
import { ReviewExportScreen } from './components/ReviewExportScreen';

export function App() {
  const loaded = useStockStore((s) => s.loaded);
  const currentScreen = useStockStore((s) => s.currentScreen);

  if (!loaded) return <UploadScreen />;
  if (currentScreen === 'export_success') return <ExportSuccessScreen />;
  if (currentScreen === 'colors') return <ColorGalleryScreen />;
  if (currentScreen === 'count') return <ColorCountScreen />;
  if (currentScreen === 'review_export') return <ReviewExportScreen />;
  return <ColorGalleryScreen />;
}
