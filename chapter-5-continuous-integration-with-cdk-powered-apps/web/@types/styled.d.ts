/* ---------- External ---------- */
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    colors: {
      primary: {
        main: string;
      }
    }
  }
}