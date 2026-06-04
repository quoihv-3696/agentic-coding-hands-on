// SVGR: `import Icon from "*.svg?react"` yields a React component.
// (Plain `import x from "*.svg"` stays a static image import, typed by Next.)
declare module "*.svg?react" {
  import type * as React from "react";
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
