import { useStockStore } from './store/useStockStore';
import { UploadScreen } from './components/UploadScreen';
import { ParentSelector } from './components/ParentSelector';
import { EditorScreen } from './components/EditorScreen';

export function App() {
  const loaded = useStockStore((s) => s.loaded);
  const activeParent = useStockStore((s) => s.activeParentCode);

  if (!loaded) return <UploadScreen />;
  if (!activeParent) return <ParentSelector />;
  return <EditorScreen />;
}
