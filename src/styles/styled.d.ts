// styled.d.ts
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    Radius: {
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
    };
    Spacing: {
      50: string;
      100: string;
      150: string;
      200: string;
      300: string;
      400: string;
      500: string;
      550: string;
      600: string;
      700: string;
      750: string;
      800: string;
      850: string;
      900: string;
      950: string;
      1000: string;
    };
    Colors: {
      Background: {
        Primary: string;
        Secondary: string;
        Tertiary: string;
        Quaternary: string;
      };
      Content: {
        Primary: string;
        Secondary: string;
        Tertiary: string;
        Quaternary: string;
      };
      Line: {
        Divider: string;
        Outline: string;
      };
      Components: {
        Fill: {
          Primary: string;
          Secondary: string;
          Tertiary: string;
        };
        Translucent: {
          Primary: string;
          Secondary: string;
          Tertiary: string;
          Interactive: string;
        };
        Interaction: {
          Hover: string;
          Pressed: string;
          Focussed: string;
        };
      };
      Solid: {
        Red: string;
        Orange: string;
        Yellow: string;
        Green: string;
        Blue: string;
        Indigo: string;
        Purple: string;
        Pink: string;
        Brown: string;
        Translucent: {
          Red: string;
          Orange: string;
          Yellow: string;
          Green: string;
          Blue: string;
          Indigo: string;
          Purple: string;
          Pink: string;
          Brown: string;
        };
        Black: string;
        White: string;
      };
      Core: {
        Brand: {
          Primary: string;
          Secondary: string;
          Tertiary: string;
        };
        Status: {
          Positive: string;
          Warning: string;
          Negative: string;
          Translucent: {
            Positive: string;
            Warning: string;
            Negative: string;
          };
        };
      };
      Calendar: {
        Exam: string;
        Home: string;
        Vacation: string;
        Event: string;
        Stay: string;
      };
    };
    Font: {
      [key in | "Display"
        | "Title"
        | "Headline"
        | "Body"
        | "Callout"
        | "Footnote"
        | "Caption"
        | "Paragraph_Large"
        | "Paragraph_Small"]: {
        size: string;
        lineHeight: string;
        weight: { [key: string]: number };
      };
    };
  }
}