import { lazy, Suspense, useMemo } from "react";

const windowModules = import.meta.glob("../Applications/*/*.tsx");
const windowRegistry: Record<string, () => Promise<{ default: React.ComponentType<unknown> }>> = {};

for (const path in windowModules) {
    const match = path.match(/\..\/Applications\/(.+)\/\1\.tsx$/);
    if (match) {
        const appId = match[1];
        windowRegistry[appId] = windowModules[path] as () => Promise<{
            default: React.ComponentType<unknown>;
        }>;
    }
}

interface WindowContentProps {
    appId: string | undefined;
}

export const WindowContent = ({ appId }: WindowContentProps) => {
    const importer = appId ? windowRegistry[appId] : null;

    const Component = useMemo(() => {
        if (!importer) return null;
        return lazy(importer);
    }, [importer]);

    if (!Component) return null;

    return (
        <Suspense fallback={null}>
            <Component />
        </Suspense>
    );
}