// Legacy Chat component - redirects to IntegratedChat
// This exists for backward compatibility in case any imports still reference it
import IntegratedChat from './IntegratedChat';

export default function Chat() {
  return <IntegratedChat />;
}
