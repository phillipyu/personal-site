import "react";

declare module "react" {
  interface CSSProperties {
    ["--smiski-src"]?: string;
  }
}
