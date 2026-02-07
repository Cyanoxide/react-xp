import { lazy, Suspense, useMemo } from "react";

interface WindowAppProps {
    appId?: string;
    componentId?: string;
    landingUrl?: string;
}

type WindowContentProps = WindowAppProps;

const windowModules = import.meta.glob("../Applications/*/*.tsx");

const windowRegistry: Record<
    string,
    () => Promise<{ default: React.ComponentType<WindowAppProps> }>
> = {};

for (const path in windowModules) {
    const match = path.match(/\..\/Applications\/(.+)\/\1\.tsx$/);
    if (match) {
        const componentId = match[1];
        windowRegistry[componentId] = windowModules[path] as () => Promise<{
            default: React.ComponentType<WindowAppProps>;
        }>;
    }
}

export const WindowContent = ({ componentId, ...props }: WindowContentProps) => {
    const importer = componentId ? windowRegistry[componentId] : null;

    const Component = useMemo(() => {
        if (!importer) return null;
        return lazy(importer);
    }, [importer]);

    if (!Component || !componentId) return null;

    return (
        <Suspense fallback={null}>
            <Component {...props} />
        </Suspense>
    );
};
