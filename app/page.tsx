import Homepage from '@/components/Homepage';
import { SettingsProvider } from '@/components/SettingsProvider';

export default function HomePage() {
  return (
    <SettingsProvider>
      <Homepage />
    </SettingsProvider>
  );
}
